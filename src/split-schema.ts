import { loadSchema } from "./load-schema";
import { createSubSchema } from "./create-sub-schema";
import { IConfig } from "./schema-splitting.interface";

export const spltSchema = async (schemaPath: string, config: IConfig) => {
  const nodesMap = await loadSchema(schemaPath);
  await createSubSchema(nodesMap, config);
};
