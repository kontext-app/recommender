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
