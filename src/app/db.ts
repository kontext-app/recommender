import { Db, MongoClient } from 'mongodb';

import config from 'app/config';

export let mongoClient: MongoClient;
export let db: Db;

export async function connectMongoClient(): Promise<void> {
  mongoClient = await MongoClient.connect(config.MONGO_DB_CONNECT, {
    useUnifiedTopology: true,
  });
  db = mongoClient.db('indexer');
  console.log(`⚡️[db]: Connected to MongoDB at ${config.MONGO_DB_CONNECT}`);
}

type User = {
  did: string;
  recommendationsEnabled: boolean;
};

export async function upsertUser(user: User): Promise<void> {
  const collection = await db.collection('users');
  const result = await collection.updateOne(
    { did: user.did },
    {
      $set: {
        did: user.did,
        recommendationsEnabled: user.recommendationsEnabled,
      },
    },
    { upsert: true }
  );
  console.log(
    `⚡️[db] upsertUsers: ${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`
  );
  return;
}
