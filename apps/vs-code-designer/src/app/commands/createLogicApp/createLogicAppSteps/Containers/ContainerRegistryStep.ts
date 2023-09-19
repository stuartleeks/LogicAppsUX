/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize } from '../../../../../localize';
import type { AppServiceWizardContext } from '../LogicAppHostingPlanStep';
import {
  type INewStorageAccountDefaults,
  StorageAccountKind,
  StorageAccountListStep,
  StorageAccountPerformance,
  StorageAccountReplication,
} from '@microsoft/vscode-azext-azureutils';
import { AzureWizardPromptStep, type IWizardOptions, type IAzureQuickPickItem } from '@microsoft/vscode-azext-utils';

export enum ContainerRegistryType {
  Azure = 'Azure container registry',
  DockerHub = 'Docker hub',
}

export class ContainerRegistryStep extends AzureWizardPromptStep<AppServiceWizardContext> {
  public async prompt(wizardContext: AppServiceWizardContext): Promise<void> {
    const placeHolder: string = localize('selectNewProjectFolder', 'Select container registry type');
    const picks: IAzureQuickPickItem<string>[] = [
      { label: localize('azure container', ContainerRegistryType.Azure), data: ContainerRegistryType.Azure },
      { label: localize('docker hub', ContainerRegistryType.DockerHub), data: ContainerRegistryType.DockerHub },
    ];
    wizardContext.containerRegistry = (await wizardContext.ui.showQuickPick(picks, { placeHolder })).data;
  }

  public shouldPrompt(): boolean {
    return true;
  }

  public async getSubWizard(wizardContext: AppServiceWizardContext): Promise<IWizardOptions<AppServiceWizardContext> | undefined> {
    const { containerRegistry } = wizardContext;

    if (containerRegistry === ContainerRegistryType.Azure) {
      const storageAccountCreateOptions: INewStorageAccountDefaults = {
        kind: StorageAccountKind.Storage,
        performance: StorageAccountPerformance.Standard,
        replication: StorageAccountReplication.LRS,
      };
      return {
        promptSteps: [
          new StorageAccountListStep(storageAccountCreateOptions, {
            kind: [StorageAccountKind.BlobStorage],
            learnMoreLink: 'https://aka.ms/Cfqnrc',
          }),
        ],
      };
    }
    return undefined;
  }
}
