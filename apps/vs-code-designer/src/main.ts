import { runPostWorkflowCreateStepsFromCache } from './app/commands/createCodeless/createCodelessSteps/WorkflowCreateStepBase';
import { validateFuncCoreToolsIsLatest } from './app/commands/funcCoreTools/validateFuncCoreToolsIsLatest';
import { registerCommands } from './app/commands/registerCommands';
import { LogicAppsBranchDataProvider } from './app/tree/LogicAppsBranchDataProvider';
import { stopDesignTimeApi } from './app/utils/codeless/startDesignTimeApi';
import { UriHandler } from './app/utils/codeless/urihandler';
import { getExtensionVersion } from './app/utils/extension';
import { registerFuncHostTaskEvents } from './app/utils/funcCoreTools/funcHostTask';
import { verifyVSCodeConfigOnActivate } from './app/utils/vsCodeConfig/verifyVSCodeConfigOnActivate';
import { extensionCommand } from './constants';
import { ext } from './extensionVariables';
import { registerAppServiceExtensionVariables } from '@microsoft/vscode-azext-azureappservice';
import {
  callWithTelemetryAndErrorHandling,
  createAzExtOutputChannel,
  registerEvent,
  registerReportIssueCommand,
  registerUIExtensionVariables,
  createExperimentationService,
  TreeElementStateManager,
  type IActionContext,
} from '@microsoft/vscode-azext-utils';
import { AzExtResourceType, getAzureResourcesExtensionApi } from '@microsoft/vscode-azureresources-api';
import * as vscode from 'vscode';

const perfStats = {
  loadStartTime: Date.now(),
  loadEndTime: undefined,
};

export async function activate(context: vscode.ExtensionContext) {
  ext.context = context;

  ext.outputChannel = createAzExtOutputChannel('Azure Logic Apps (Standard)', ext.prefix);

  registerUIExtensionVariables(ext);
  registerAppServiceExtensionVariables(ext);

  await callWithTelemetryAndErrorHandling(extensionCommand.activate, async (activateContext: IActionContext) => {
    activateContext.telemetry.properties.isActivationEvent = 'true';
    activateContext.telemetry.measurements.mainFileLoad = (perfStats.loadEndTime - perfStats.loadStartTime) / 1000;

    runPostWorkflowCreateStepsFromCache();
    validateFuncCoreToolsIsLatest();

    ext.extensionVersion = getExtensionVersion();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore

    callWithTelemetryAndErrorHandling(extensionCommand.validateLogicAppProjects, async (actionContext: IActionContext) => {
      await verifyVSCodeConfigOnActivate(actionContext, vscode.workspace.workspaceFolders);
    });

    registerEvent(
      extensionCommand.validateLogicAppProjects,
      vscode.workspace.onDidChangeWorkspaceFolders,
      async (actionContext: IActionContext, event: vscode.WorkspaceFoldersChangeEvent) => {
        await verifyVSCodeConfigOnActivate(actionContext, event.added);
      }
    );

    context.subscriptions.push(ext.outputChannel);

    registerReportIssueCommand(extensionCommand.reportIssue);
    registerCommands();
    registerFuncHostTaskEvents();

    ext.experimentationService = await createExperimentationService(context);
    ext.state = new TreeElementStateManager();
    ext.rgApiV2 = await getAzureResourcesExtensionApi(context, '2.0.0');
    ext.branchDataProvider = new LogicAppsBranchDataProvider();
    ext.rgApiV2.resources.registerAzureResourceBranchDataProvider(AzExtResourceType.LogicApp, ext.branchDataProvider);

    vscode.window.registerUriHandler(new UriHandler());
  });
}

export function deactivate(): Promise<any> {
  stopDesignTimeApi();
  return undefined;
}

perfStats.loadEndTime = Date.now();
