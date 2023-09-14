/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { createWebSiteClient } from '../utils/azureClients';
import { getIconPath } from '../utils/tree/assets';
import { LogicAppResourceTree } from './LogicAppResourceTree';
import type { TreeElementBase } from './LogicAppsBranchDataProvider';
import type { ConfigurationsTreeItem } from './configurationsTree/ConfigurationsTreeItem';
import type { RemoteWorkflowsTreeItem } from './remoteWorkflowsTree/RemoteWorkflowsTreeItem';
import type { SlotsTreeItem } from './slotsTree/SlotsTreeItem';
import type { ArtifactsTreeItem } from './slotsTree/artifactsTree/ArtifactsTreeItem';
import type { Site } from '@azure/arm-appservice';
import {
  type DeploymentsTreeItem,
  type LogFilesTreeItem,
  type SiteFilesTreeItem,
  ParsedSite,
} from '@microsoft/vscode-azext-azureappservice';
import type { AppSettingsTreeItem } from '@microsoft/vscode-azext-azureappsettings';
import { type AzExtClientContext, getResourceGroupFromId } from '@microsoft/vscode-azext-azureutils';
import {
  type IActionContext,
  callWithTelemetryAndErrorHandling,
  createSubscriptionContext,
  nonNullProp,
} from '@microsoft/vscode-azext-utils';
import type { AzureResource, AzureSubscription } from '@microsoft/vscode-azureresources-api';
import { ProjectSource } from '@microsoft/vscode-extension';
import { type TreeItem, TreeItemCollapsibleState } from 'vscode';

type ManagedEnvironmentModel = Site & ResourceModel;

export class LogicAppsItem implements TreeElementBase {
  public static contextValue = 'azLogicAppsProductionSlot';
  static readonly contextValueRegExp: RegExp = new RegExp(LogicAppsItem.contextValue);
  public readonly instance = LogicAppsItem.contextValue;

  public site: ParsedSite;
  public data: Site;

  public logStreamPath = '';
  public appSettingsTreeItem: AppSettingsTreeItem;
  public deploymentsNode: DeploymentsTreeItem | undefined;
  public readonly source: ProjectSource = ProjectSource.Remote;

  public contextValuesToAdd?: string[] | undefined;
  public maskedValuesToAdd: string[] = [];

  public configurationsTreeItem: ConfigurationsTreeItem;
  private _workflowsTreeItem: RemoteWorkflowsTreeItem | undefined;
  private _artifactsTreeItem: ArtifactsTreeItem;
  private _logFilesTreeItem: LogFilesTreeItem;
  private _siteFilesTreeItem: SiteFilesTreeItem;
  private _slotsTreeItem: SlotsTreeItem;

  public static pickSlotContextValue = new RegExp(/azLogicAppsSlot(?!s)/);
  public static productionContextValue = 'azLogicAppsProductionSlot';
  public static slotContextValue = 'azLogicAppsSlot';

  id: string;

  constructor(
    public readonly subscription: AzureSubscription,
    public readonly resource: AzureResource,
    public readonly managedEnvironment: ManagedEnvironmentModel
  ) {
    this.id = managedEnvironment.id;
    this.site = new ParsedSite(managedEnvironment, subscription as any);
    this.data = this.site.rawSite;
    this.contextValuesToAdd = [this.site.isSlot ? LogicAppResourceTree.slotContextValue : LogicAppResourceTree.productionContextValue];

    const valuesToMask = [
      this.site.siteName,
      this.site.slotName,
      this.site.defaultHostName,
      this.site.resourceGroup,
      this.site.planName,
      this.site.planResourceGroup,
      this.site.kuduHostName,
      this.site.gitUrl,
      this.site.rawSite.repositorySiteName,
      ...(this.site.rawSite.hostNames || []),
      ...(this.site.rawSite.enabledHostNames || []),
    ];

    for (const v of valuesToMask) {
      if (v) {
        this.maskedValuesToAdd.push(v);
      }
    }
  }

  async getChildren(): Promise<any[]> {
    const result = await callWithTelemetryAndErrorHandling('getChildren', async (context) => {
      console.log(context);
      return [];
    });

    return result ?? [];
  }

  getTreeItem(): TreeItem {
    return {
      label: this.managedEnvironment.name,
      id: this.id,
      iconPath: getIconPath(LogicAppsItem.contextValue),
      contextValue: LogicAppsItem.contextValue,
      collapsibleState: TreeItemCollapsibleState.Collapsed,
    };
  }

  static async Get(
    context: IActionContext,
    subscription: AzureSubscription,
    resourceGroup: string,
    name: string
  ): Promise<ManagedEnvironmentModel> {
    const subContext = createSubscriptionContext(subscription);
    const client = await createWebSiteClient({ ...context, ...subContext } as AzExtClientContext);
    const site = await client.webApps.get(resourceGroup, name);
    return LogicAppsItem.CreateManagedEnvironmentModel(site);
  }

  private static CreateManagedEnvironmentModel(managedEnvironment: Site): ManagedEnvironmentModel {
    return createAzureResourceModel(managedEnvironment);
  }
}

interface ResourceModel {
  id: string;
  name: string;
  resourceGroup: string;
}

function createAzureResourceModel<T extends Site>(resource: T): T & ResourceModel {
  const id = nonNullProp(resource, 'id');
  return {
    id,
    name: nonNullProp(resource, 'name'),
    resourceGroup: getResourceGroupFromId(id),
    ...resource,
  };
}
