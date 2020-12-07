export interface ISchemaConfig {
  Query?: any;
  Mutation?: any;
  Subscription?: any;
}

export interface IConfigOptions {
  schemaConfig: ISchemaConfig;
}

export interface IConfig {
  [key: string]: IConfigOptions;
}

export interface IOptions {
  typesMap: Map<string, any>;
}
