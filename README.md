# schema-splitting

Splits the schema into smaller completed schemas which can be used independently.

Each schema has all the types and input it needs.

## For example

Conside we have a schema with 2 queries.

```graphql
type Query {
  Tweet(id: ID!): Tweet
  Tweets(limit: Int, skip: Int, sort_field: String, sort_order: String): [Tweet]
}

type Tweet {
  id: ID!
  # The tweet text. No more than 140 characters!
  body: String
  # When the tweet was published
  date: Date
  # Who published the tweet
  Author: User
}

scalar Date
scalar Url

type User {
  id: ID!
  username: String
  first_name: String
  last_name: String
  full_name: String
  name: String @deprecated
  avatar_url: Url
}
```

Now we want to split the 2 queries into 1-1 query sub-schema. This tools will split it in this way.

Schema-1.graphql

```graphql
type Query {
  Tweet(id: ID!): Tweet
}

type Tweet {
  id: ID!
  # The tweet text. No more than 140 characters!
  body: String
  # When the tweet was published
  date: Date
  # Who published the tweet
  Author: User
}

scalar Date
scalar Url

type User {
  id: ID!
  username: String
  first_name: String
  last_name: String
  full_name: String
  name: String @deprecated
  avatar_url: Url
}
```

Schema-2.graphql

```graphql
type Query {
  Tweets(limit: Int, skip: Int, sort_field: String, sort_order: String): [Tweet]
}

type Tweet {
  id: ID!
  # The tweet text. No more than 140 characters!
  body: String
  # When the tweet was published
  date: Date
  # Who published the tweet
  Author: User
}

scalar Date
scalar Url

type User {
  id: ID!
  username: String
  first_name: String
  last_name: String
  full_name: String
  name: String @deprecated
  avatar_url: Url
}
```

For the above split, below is the config object

```javascript
const config = {
  "./schema-1.graphql": {
    schemaConfig: {
      Query: {
        Tweet: "Tweet",
      },
    },
  },

  "./schema-2.graphql": {
    schemaConfig: {
      Query: {
        Tweets: "Tweets",
      },
    },
  },
};
```

## Usage

```
import { splitSchema } from "schema-splitting";

splitSchema(schemaPath, config)

```

## Test

To test it just run `yarn test`

## API

### splitSchema(schemaPath, config)

Returns a Promise<void>

## Options

### schemaPath

type: `string`

It accepts the path to schema which needs to be splitted. It should be in SDL format.

### config

type: `IConfig`

`IConfig` is a type of `splitSchemaPath : Object` (key:value) pair
it accepts a `schemaConfig` object, which is of the form of `Query, Mutation, Subscription`.

```javascript
{
    Query: {
        User:"User"
    },
    Mutation: {
        createUser:"createuser"
    },
    Subscription: {
        poll:"poll"
    }
}
```

Sample schemaConfig object

```javascript
const config = const config: IConfig = {
    `./schema-1.graphql`: {
      schemaConfig: {
        Query: {
          User: "User",
        },
        Mutation: {
            createTweet:"createTweet"
        }
      },
    },
    `./schema-2.graphql`: {
      schemaConfig: {
          Query:{
            Notifications: "Notifications",
            NotificationsMeta: "NotificationsMeta"
          },
        Mutation: {
          deleteTweet: "deleteTweet",
          markTweetRead: "markTweetRead",
        },
      },
    },
  };

```

## Does it supports field resolver (WIP)

Yes it does
In that case the config object would like this

```javascript
const config = {
  "./schema-1.graphql": {
    schemaConfig: {
      Tweet: {
        Author: "Author",
        stats: "Stats",
      },
    },
  },
};
```

## Merging splitted schema

We can merge splitted schema by using `mergeSchemas` from `graphql-tools`. On merging it creates the exact same schema as we had earlier before splitting.

One can look into `test/merge-schema.ts`
