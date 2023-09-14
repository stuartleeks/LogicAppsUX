/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ext } from '../../../extensionVariables';
import { localize } from '../../../localize';
import type { LogicAppsItem } from '../../tree/LogicAppsItem';
import type { PickItemOptions } from './PickItemOptions';
import {
  QuickPickAzureResourceStep,
  QuickPickAzureSubscriptionStep,
  QuickPickGroupStep,
  runQuickPickWizard,
  type AzureResourceQuickPickWizardContext,
  type IActionContext,
  type QuickPickWizardContext,
  type AzureWizardPromptStep,
} from '@microsoft/vscode-azext-utils';
import { AzExtResourceType, type ResourceGroupsTreeDataProvider } from '@microsoft/vscode-azureresources-api';

export function getPickEnvironmentSteps(): AzureWizardPromptStep<AzureResourceQuickPickWizardContext>[] {
  const tdp: ResourceGroupsTreeDataProvider = ext.rgApiV2.resources.azureResourceTreeDataProvider;
  const types = [AzExtResourceType.ContainerAppsEnvironment];

  return [
    new QuickPickAzureSubscriptionStep(tdp),
    new QuickPickGroupStep(tdp, {
      groupType: types,
    }),
    new QuickPickAzureResourceStep(
      tdp,
      {
        resourceTypes: types,
        skipIfOne: false,
      },
      {
        placeHolder: localize('selectContainerAppsEnvironment', 'Select a container apps environment'),
      }
    ),
  ];
}

export async function pickEnvironment(context: IActionContext, options?: PickItemOptions): Promise<LogicAppsItem> {
  const promptSteps: AzureWizardPromptStep<QuickPickWizardContext>[] = [...getPickEnvironmentSteps()];

  return await runQuickPickWizard(context, {
    promptSteps,
    title: options?.title,
  });
}
