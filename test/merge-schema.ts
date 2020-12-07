import * as globby from "globby";
import * as path from "path";
import { promises as fs } from "fs";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { mergeSchemas } from "graphql-tools";
import { GraphQLSchema, printSchema } from "graphql";

const ROOT_DIR = path.resolve(__dirname, "..");

export const mergeSchema = async () => {
  const schemaPaths: string[] = await globby(
    path.join(ROOT_DIR, "./test/schema/split-sub-schema/*")
  );

  const splittedExecutableSchemas: GraphQLSchema[] = [];
  await Promise.all(
    schemaPaths.map(async (schemaPath) => {
      const schema = await fs.readFile(schemaPath, "utf-8");
      const executableSchema = makeExecutableSchema({ typeDefs: schema });
      splittedExecutableSchemas.push(executableSchema);
    })
  );

  const mergedSchema: GraphQLSchema = mergeSchemas({
    schemas: splittedExecutableSchemas,
  });

  await fs.writeFile(
    path.join(ROOT_DIR, "./test/schema/schema-merge.graphql"),
    printSchema(mergedSchema),
    "utf-8"
  );
};

mergeSchema();
