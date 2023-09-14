/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ext } from '../../../extensionVariables';
import { localize } from '../../../localize';
import { LogicAppsItem } from '../../tree/LogicAppsItem';
import type { PickItemOptions } from './PickItemOptions';
import { getPickEnvironmentSteps } from './pickEnvironment';
import {
  ContextValueQuickPickStep,
  runQuickPickWizard,
  type AzureResourceQuickPickWizardContext,
  type AzureWizardPromptStep,
  type IActionContext,
  type QuickPickWizardContext,
} from '@microsoft/vscode-azext-utils';

export function getPickLogicAppSteps(): AzureWizardPromptStep<AzureResourceQuickPickWizardContext>[] {
  return [
    ...getPickEnvironmentSteps(),
    new ContextValueQuickPickStep(
      ext.rgApiV2.resources.azureResourceTreeDataProvider,
      {
        contextValueFilter: { include: LogicAppsItem.contextValueRegExp },
        skipIfOne: true,
      },
      {
        placeHolder: localize('selectLogicApp', 'Select a logic app'),
        noPicksMessage: localize('noLogicApps', 'Selected logic apps environment has no apps'),
      }
    ),
  ];
}

export async function pickLogicApp(context: IActionContext, options?: PickItemOptions): Promise<LogicAppsItem> {
  const promptSteps: AzureWizardPromptStep<QuickPickWizardContext>[] = [...getPickLogicAppSteps()];

  return await runQuickPickWizard(context, {
    promptSteps,
    title: options?.title,
  });
}
