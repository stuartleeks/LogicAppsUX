/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ext } from '../../../extensionVariables';
import { localize } from '../../../localize';
import { LogicAppsItem } from '../../tree/LogicAppsItem';
import type { PickItemOptions } from './PickItemOptions';
import { getPickEnvironmentSteps } from './pickEnvironment';
import { AppSettingTreeItem, type AppSettingsTreeItem } from '@microsoft/vscode-azext-azureappsettings';
import {
  ContextValueQuickPickStep,
  runQuickPickWizard,
  type AzureResourceQuickPickWizardContext,
  type AzureWizardPromptStep,
  type IActionContext,
  type QuickPickWizardContext,
} from '@microsoft/vscode-azext-utils';

export function getPickLogicAppSettingsSteps(): AzureWizardPromptStep<AzureResourceQuickPickWizardContext>[] {
  return [
    ...getPickEnvironmentSteps(),
    new ContextValueQuickPickStep(
      ext.rgApiV2.resources.azureResourceTreeDataProvider,
      {
        contextValueFilter: { include: LogicAppsItem.contextValueRegExp },
        skipIfOne: true,
      },
      {
        placeHolder: localize('selectLogicApp', 'Select a logic app settings'),
        noPicksMessage: localize('noLogicApps', 'Selected logic apps environment has no settings'),
      }
    ),
  ];
}

export async function pickLogicAppSettings(context: IActionContext, options?: PickItemOptions): Promise<AppSettingsTreeItem> {
  const promptSteps: AzureWizardPromptStep<QuickPickWizardContext>[] = [...getPickLogicAppSettingsSteps()];

  return await runQuickPickWizard(context, {
    promptSteps,
    title: options?.title,
  });
}

export function getPickLogicAppSettingSteps(): AzureWizardPromptStep<AzureResourceQuickPickWizardContext>[] {
  return [
    ...getPickEnvironmentSteps(),
    new ContextValueQuickPickStep(
      ext.rgApiV2.resources.azureResourceTreeDataProvider,
      {
        contextValueFilter: { include: new RegExp(AppSettingTreeItem.contextValue) },
        skipIfOne: true,
      },
      {
        placeHolder: localize('selectLogicApp', 'Select a logic app settings'),
        noPicksMessage: localize('noLogicApps', 'Selected logic apps environment has no settings'),
      }
    ),
  ];
}

export async function pickLogicAppSetting(context: IActionContext, options?: PickItemOptions): Promise<AppSettingTreeItem> {
  const promptSteps: AzureWizardPromptStep<QuickPickWizardContext>[] = [...getPickLogicAppSettingsSteps()];

  return await runQuickPickWizard(context, {
    promptSteps,
    title: options?.title,
  });
}
