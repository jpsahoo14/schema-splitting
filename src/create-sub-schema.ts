import {
  DefinitionNode,
  DocumentNode,
  print,
  ObjectTypeDefinitionNode,
  NamedTypeNode,
  ListTypeNode,
  InputValueDefinitionNode,
  TypeNode,
  FieldDefinitionNode,
  UnionTypeDefinitionNode,
} from "graphql";
import { scalarTypes } from "./constants";
import { cloneDeep } from "lodash";
import { promises as fs } from "fs";
import { IConfig, IOptions } from "./schema-splitting.interface";

export const createSubSchema = async (
  nodesMap: Map<string, ObjectTypeDefinitionNode>,
  config: IConfig
) => {
  for (const schemaPath in config) {
    if (Object.prototype.hasOwnProperty.call(config, schemaPath)) {
      const { schemaConfig } = config[schemaPath];
      const typesMap = new Map<string, any>();
      const document: Omit<DocumentNode, "definitions"> & {
        definitions: Array<DefinitionNode>;
      } = {
        kind: "Document",
        definitions: [],
      };

      for (const rootFieldName in schemaConfig) {
        if (Object.prototype.hasOwnProperty.call(schemaConfig, rootFieldName)) {
          if (
            rootFieldName == "Query" ||
            rootFieldName == "Mutation" ||
            rootFieldName == "Subscription"
          ) {
            const { fieldsToAdd } = processRootFields(
              rootFieldName,
              schemaConfig[rootFieldName],
              nodesMap,
              { typesMap }
            );

            let rootField = cloneDeep(nodesMap.get(rootFieldName));
            rootField = { ...rootField, fields: fieldsToAdd } as any;
            if (rootField) {
              document.definitions.push(rootField);
            }
          }
        }
      }

      typesMap.forEach((value, key) => {
        document.definitions.push(value);
      });

      await fs.writeFile(schemaPath, print(document), "utf-8");
    }
  }
};

const processRootFields = (
  rootFieldName: string,
  fieldsObject: any,
  nodesMap: Map<string, ObjectTypeDefinitionNode>,
  options: IOptions
) => {
  const fieldsToAdd: FieldDefinitionNode[] = [];
  const rootField: ObjectTypeDefinitionNode | undefined = nodesMap.get(
    rootFieldName
  );
  rootField?.fields?.forEach((field: FieldDefinitionNode) => {
    const fieldName = field.name.value;
    for (const askedField in fieldsObject) {
      if (Object.prototype.hasOwnProperty.call(fieldsObject, askedField)) {
        if (askedField === fieldName) {
          fieldsToAdd.push(cloneDeep(field));
          field.arguments?.forEach((arg: InputValueDefinitionNode) => {
            addFieldToDocument(arg, nodesMap, options);
          });
          addFieldToDocument(field, nodesMap, options);
        }
      }
    }
  });

  return { fieldsToAdd };
};

const addFieldToDocument = (
  field: InputValueDefinitionNode | FieldDefinitionNode,
  nodesMap: Map<string, ObjectTypeDefinitionNode>,
  options: IOptions
) => {
  const typeName = getTypeName(field.type);
  return addTypeToDocument(typeName, nodesMap, options);
};

const addTypeToDocument = (
  typeName: string,
  nodesMap: Map<string, ObjectTypeDefinitionNode>,
  options: IOptions
) => {
  if (options.typesMap.has(typeName)) {
    return;
  }
  const found = isScalarType(typeName);
  if (found) {
    return;
  }
  const clonedTypeDefinition:
    | UnionTypeDefinitionNode
    | ObjectTypeDefinitionNode = getClonedTypedDefinition(nodesMap, typeName);

  if (clonedTypeDefinition === undefined) {
    return;
  }
  options.typesMap.set(typeName, clonedTypeDefinition);

  if (isUnionTypeDefinitionNode(clonedTypeDefinition)) {
    ((clonedTypeDefinition as unknown) as UnionTypeDefinitionNode).types.forEach(
      (type) => {
        addTypeToDocument(type.name.value, nodesMap, options);
      }
    );
  } else {
    clonedTypeDefinition?.fields?.forEach((field) => {
      addFieldToDocument(field, nodesMap, options);
    });
  }
};

const getTypeName = (type: TypeNode): string => {
  if ((type as NamedTypeNode).name != undefined) {
    return (type as NamedTypeNode).name.value;
  }

  return getTypeName((type as ListTypeNode).type);
};

const isScalarType = (typeName: string) => {
  return scalarTypes.find((scalar) => scalar === typeName);
};
const isUnionTypeDefinitionNode = (
  clonedTypeDefinition: ObjectTypeDefinitionNode
) => {
  return (
    ((clonedTypeDefinition as unknown) as UnionTypeDefinitionNode).kind ===
    "UnionTypeDefinition"
  );
};

const getClonedTypedDefinition = (
  nodesMap: Map<string, ObjectTypeDefinitionNode>,
  typeName: string
) => {
  const typeDefinition:
    | ObjectTypeDefinitionNode
    | undefined
    | UnionTypeDefinitionNode = nodesMap.get(typeName);

  const clonedTypeDefinition:
    | UnionTypeDefinitionNode
    | ObjectTypeDefinitionNode = cloneDeep(typeDefinition);
  return clonedTypeDefinition;
};
