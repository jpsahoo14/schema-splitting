import * as path from "path";
import { IConfig, spltSchema } from "../index";
import { mergeSchema } from "./merge-schema";

const ROOT_DIR = path.resolve(__dirname, "..");

const schemaSplitting = async () => {
  const schemaQuery = `${path.join(
    ROOT_DIR,
    "./test/schema/split-sub-schema/schema_query.graphql"
  )}`;
  const schemaMutation = `${path.join(
    ROOT_DIR,
    "./test/schema/split-sub-schema/schema_mutation.graphql"
  )}`;
  const SCHEMA_PATH = "./test/schema/schema-original.graphql";
  const schema = path.join(ROOT_DIR, SCHEMA_PATH);

  const config: IConfig = {
    [schemaQuery]: {
      schemaConfig: {
        Query: {
          User: "User",
          Tweet: "Tweet",
          Tweets: "Tweets",
          Notifications: "Notifications",
          NotificationsMeta: "NotificationsMeta",
        },
      },
    },
    [schemaMutation]: {
      schemaConfig: {
        Mutation: {
          createTweet: "createTweet",
          deleteTweet: "deleteTweet",
          markTweetRead: "markTweetRead",
        },
      },
    },
  };

  await spltSchema(schema, config);
};

export const testSchemaSplitting = async () => {
  await schemaSplitting();
  await mergeSchema();
};

testSchemaSplitting();
