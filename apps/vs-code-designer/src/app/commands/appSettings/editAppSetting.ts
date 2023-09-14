/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { pickLogicAppSetting } from '../../utils/pickItem/pickLogicAppSettings';
import type { AppSettingTreeItem } from '@microsoft/vscode-azext-azureappsettings';
import type { IActionContext } from '@microsoft/vscode-azext-utils';

export async function editAppSetting(context: IActionContext, node?: AppSettingTreeItem): Promise<void> {
  node ??= await pickLogicAppSetting(context);

  await node.edit(context);
}
