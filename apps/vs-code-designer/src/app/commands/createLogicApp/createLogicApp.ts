/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { projectLanguageSetting, workflowappRuntime } from '../../../constants';
import { ext } from '../../../extensionVariables';
import { localize } from '../../../localize';
import type { LogicAppsItem } from '../../tree/LogicAppsItem';
import { createActivityContext } from '../../utils/activityUtils';
import { getDefaultFuncVersion } from '../../utils/funcCoreTools/funcVersion';
import { pickEnvironment } from '../../utils/pickItem/pickEnvironment';
import { getWorkspaceSettingFromAnyFolder, getFunctionsWorkerRuntime } from '../../utils/vsCodeConfig/settings';
import { AzureStorageAccountStep } from '../deploy/storageAccountSteps/AzureStorageAccountStep';
import { CustomLocationStorageAccountStep } from '../deploy/storageAccountSteps/CustomLocationStorageAccountStep';
import { LogicAppCreateStep } from './createLogicAppSteps/LogicAppCreateStep';
import { LogicAppHostingPlanStep, setSiteOS } from './createLogicAppSteps/LogicAppHostingPlanStep';
import {
  AppKind,
  WebsiteOS,
  SiteNameStep,
  CustomLocationListStep,
  AppInsightsCreateStep,
  AppInsightsListStep,
  type IAppServiceWizardContext,
} from '@microsoft/vscode-azext-azureappservice';
import {
  ResourceGroupListStep,
  type INewStorageAccountDefaults,
  StorageAccountKind,
  StorageAccountPerformance,
  StorageAccountReplication,
  StorageAccountCreateStep,
  StorageAccountListStep,
  VerifyProvidersStep,
} from '@microsoft/vscode-azext-azureutils';
import {
  nonNullProp,
  type IActionContext,
  AzureWizard,
  type AzureWizardExecuteStep,
  type AzureWizardPromptStep,
} from '@microsoft/vscode-azext-utils';
import { FuncVersion, type IFunctionAppWizardContext, type ICreateLogicAppContext } from '@microsoft/vscode-extension';

export async function createLogicApp(
  context: IActionContext & Partial<ICreateLogicAppContext>,
  node?: LogicAppsItem,
  nodesOrNewResourceGroupName?: string | (string | LogicAppsItem)[]
): Promise<string> {
  const newResourceGroupName = Array.isArray(nodesOrNewResourceGroupName) ? undefined : nodesOrNewResourceGroupName;

  node ??= await pickEnvironment(context, {
    title: localize('createContainerApp', 'Create Container App'),
  });

  context.newResourceGroupName = newResourceGroupName;

  const version: FuncVersion = await getDefaultFuncVersion(context);
  const language: string | undefined = getWorkspaceSettingFromAnyFolder(projectLanguageSetting);

  context.telemetry.properties.projectRuntime = version;
  context.telemetry.properties.projectLanguage = language;

  const wizardContext: IFunctionAppWizardContext = Object.assign(context, node.subscription, {
    newSiteKind: AppKind.workflowapp,
    resourceGroupDeferLocationStep: true,
    version,
    language,
    newSiteRuntime: workflowappRuntime,
    ...(await createActivityContext()),
  }) as any;

  if (version === FuncVersion.v1) {
    // v1 doesn't support linux
    wizardContext.newSiteOS = WebsiteOS.windows;
  }

  await setRegionsTask(wizardContext);

  const promptSteps: AzureWizardPromptStep<IAppServiceWizardContext>[] = [];
  const executeSteps: AzureWizardExecuteStep<IAppServiceWizardContext>[] = [];

  promptSteps.push(new SiteNameStep());
  CustomLocationListStep.addStep(context as any, promptSteps);
  promptSteps.push(new LogicAppHostingPlanStep());
  promptSteps.push(new ResourceGroupListStep());

  const storageAccountCreateOptions: INewStorageAccountDefaults = {
    kind: StorageAccountKind.Storage,
    performance: StorageAccountPerformance.Standard,
    replication: StorageAccountReplication.LRS,
  };

  if (!context.advancedCreation) {
    wizardContext.runtimeFilter = getFunctionsWorkerRuntime(language);
    executeSteps.push(new StorageAccountCreateStep(storageAccountCreateOptions));
    executeSteps.push(new AppInsightsCreateStep());
  } else {
    if (wizardContext.customLocation) {
      promptSteps.push(new CustomLocationStorageAccountStep(context));
    } else {
      promptSteps.push(
        new StorageAccountListStep(storageAccountCreateOptions, {
          kind: [StorageAccountKind.BlobStorage],
          performance: [StorageAccountPerformance.Premium],
          replication: [StorageAccountReplication.ZRS],
          learnMoreLink: 'https://aka.ms/Cfqnrc',
        })
      );
      promptSteps.push(new AzureStorageAccountStep());
      promptSteps.push(new AppInsightsListStep());
    }
  }

  executeSteps.push(new VerifyProvidersStep(['Microsoft.Web', 'Microsoft.Storage', 'Microsoft.Insights']));
  executeSteps.push(new LogicAppCreateStep());

  const title: string = localize('functionAppCreatingTitle', 'Create new Logic App (Standard) in Azure');
  const wizard: AzureWizard<IAppServiceWizardContext> = new AzureWizard(wizardContext, { promptSteps, executeSteps, title });

  await wizard.prompt();

  if (wizardContext.customLocation) {
    setSiteOS(wizardContext);
  }

  await ext.state.showCreatingChild(
    node.managedEnvironment.id,
    localize('creatingLogicApp', 'Creating Logic App "{0}"...', wizardContext.newSiteName),
    async () => {
      (wizardContext.activityTitle = localize('creatingLogicApp', 'Creating Logic App "{0}"...', wizardContext.newSiteName)),
        await wizard.execute();
    }
  );

  const createdLogicApp = nonNullProp(wizardContext, 'site');
  console.log(createdLogicApp);
  //void showContainerAppCreated(createdContainerApp);
  return 'sdas';
}

async function setRegionsTask(context: IFunctionAppWizardContext): Promise<void> {
  /* To filter out georegions which only support WorkflowStandard we have to use 'ElasticPremium' as orgDomain
  since no new orgDomain is added for WorkflowStandard we will overwrite here so it filters region correctly. */
  const originalPlan = context.newPlanSku ? { ...context.newPlanSku } : undefined;

  context.newPlanSku = { tier: 'ElasticPremium' };
  context.newPlanSku = originalPlan;
}

export async function createLogicAppAdvanced(
  context: IActionContext,
  node?: LogicAppsItem,
  nodesOrNewResourceGroupName?: string | (string | LogicAppsItem)[]
): Promise<string> {
  return await createLogicApp({ ...context, advancedCreation: true }, node, nodesOrNewResourceGroupName);
}
