export interface IAppSettingsClient {
  fullName: string;
  listApplicationSettings(): Promise<IStringDictionary>;
  updateApplicationSettings(appSettings: IStringDictionary): Promise<IStringDictionary>;
}

interface IStringDictionary {
  properties?: { [propertyName: string]: string };
}
