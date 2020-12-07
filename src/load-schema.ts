import { DocumentNode, parse, Source, ObjectTypeDefinitionNode } from "graphql";
import { promises as fs } from "fs";

export const loadSchema = async (
  schemaPath: string
): Promise<Map<string, ObjectTypeDefinitionNode>> => {
  const schemaFile = await fs.readFile(schemaPath, "utf-8");
  const schemaSource = new Source(schemaFile, schemaPath);
  const parsedSchema: DocumentNode = parse(schemaSource);

  const nodesMap = processSchema(parsedSchema);
  return nodesMap;
};

const processSchema = (schema: DocumentNode) => {
  const nodesMap = new Map<string, ObjectTypeDefinitionNode>();

  schema.definitions.forEach((node: any) => {
    const nodeName = node?.name.value;
    if (nodesMap.has(nodeName)) {
      throw new Error("Duplicate type found");
    }
    nodesMap.set(nodeName, node);
  });

  return nodesMap;
};
