import { Db, MongoClient } from 'mongodb';

import config from 'app/config';

import type { BookmarkDocContent } from 'app/types';

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
    `⚡️[db] upsertUsers: ${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount}, upserted ${result.upsertedCount} document(s)`
  );
  return;
}

export async function findAllUserDIDsWithEnabledRecommendations(): Promise<
  Array<string>
> {
  const collection = await db.collection('users');
  const cursor = await collection.find(
    { recommendationsEnabled: true },
    { projection: { did: 1 } }
  );
  console.log(
    `⚡️[db] findAllUserDIDsWithEnabledRecommendations: ${await cursor.count()} document(s) found`
  );
  return (await cursor.toArray()).map((user) => user.did);
}

type BookmarksCollection = {
  docID: string;
  bookmarkDocIDs: Array<string>;
  indexKey: string;
  userDID: string;
};

export async function findAllBookmarksCollectionsOfDIDs(
  userDIDs: string[],
  indexKey: string
): Promise<BookmarksCollection[]> {
  const collection = await db.collection('bookmarks_collection');
  const cursor = await collection.find({
    userDID: { $in: userDIDs },
    indexKey,
  });
  console.log(
    `⚡️[db] findAllBookmarksCollectionsOfDIDs: ${await cursor.count()} document(s) found`
  );
  return await cursor.toArray();
}

export async function upsertBookmarksCollection(
  bookmarksCollection: BookmarksCollection
): Promise<void> {
  const collection = await db.collection('bookmarks_collection');
  const result = await collection.updateOne(
    { docID: bookmarksCollection.docID },
    {
      $set: {
        docID: bookmarksCollection.docID,
        bookmarkDocIDs: bookmarksCollection.bookmarkDocIDs,
        indexKey: bookmarksCollection.indexKey,
        userDID: bookmarksCollection.userDID,
      },
    },
    { upsert: true }
  );
  console.log(
    `⚡️[db] upsertBookmarksCollection: ${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount}, upserted ${result.upsertedCount} document(s)`
  );
  return;
}

export async function insertManyBookmarksCollections(
  bookmarksCollections: BookmarksCollection[]
): Promise<void> {
  const collection = await db.collection('bookmarks_collection');
  const result = await collection.insertMany(bookmarksCollections, {
    ordered: true,
  });
  console.log(
    `⚡️[db] insertManyBookmarksCollections: ${result.insertedCount} document(s) inserted`
  );
  return;
}

type Bookmark = BookmarkDocContent & {
  docID: string;
  numOfShares: number;
  upVotes: string[];
  downVotes: string[];
};

export async function upsertBookmark(
  bookmark: Partial<Bookmark>
): Promise<void> {
  const collection = await db.collection('bookmarks');
  const result = await collection.updateOne(
    { docID: bookmark.docID },
    {
      $set: {
        ...bookmark,
      },
      $setOnInsert: {
        numOfShares: 0,
        upVotes: [],
        downVotes: [],
      },
    },
    { upsert: true }
  );
  console.log(
    `⚡️[db] upsertBookmark: ${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount}, upserted ${result.upsertedCount} document(s)`
  );
  return;
}

export async function findAllBookmarks(): Promise<Bookmark[]> {
  const collection = await db.collection('bookmarks');
  const cursor = await collection.find({});
  console.log(
    `⚡️[db] findAllBookmarks: ${await cursor.count()} document(s) found`
  );
  return await cursor.toArray();
}

export async function insertManyBookmarks(
  bookmarks: Bookmark[]
): Promise<void> {
  const collection = await db.collection('bookmarks');
  const result = await collection.insertMany(bookmarks, { ordered: true });
  console.log(
    `⚡️[db] insertManyBookmarks: ${result.insertedCount} document(s) inserted`
  );
  return;
}
