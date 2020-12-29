import { Db, MongoClient } from 'mongodb';

import config from 'app/config';
import { logDB } from 'app/logger';

import type { BookmarkDocContent } from 'kontext-common';

export let mongoClient: MongoClient;
export let db: Db;

export async function connectMongoClient(): Promise<void> {
  mongoClient = await MongoClient.connect(config.MONGO_DB_CONNECT, {
    useUnifiedTopology: true,
  });
  db = mongoClient.db('indexer');
  logDB(`Connected to MongoDB: ${config.MONGO_DB_CONNECT}`);
}

//#region `users` collection
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
  logDB(
    `upsertUsers: ${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount}, upserted ${result.upsertedCount} document(s)`
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
  logDB(
    `findAllUserDIDsWithEnabledRecommendations: ${await cursor.count()} document(s) found`
  );
  return (await cursor.toArray()).map((user) => user.did);
}
//#endregion

//#region `bookmarks_collection` collection
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
  logDB(
    `findAllBookmarksCollectionsOfDIDs: ${await cursor.count()} document(s) found`
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
  logDB(
    `upsertBookmarksCollection: ${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount}, upserted ${result.upsertedCount} document(s)`
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
  logDB(
    `insertManyBookmarksCollections: ${result.insertedCount} document(s) inserted`
  );
  return;
}
//#endregion

//#region `bookmarks` collection
export type Bookmark = BookmarkDocContent & {
  docID: string;
  numOfShares: number;
  upVotes: string[];
  downVotes: string[];
};

export async function findBookmarkByDocID(docID: string): Promise<Bookmark> {
  const collection = await db.collection('bookmarks');
  const result = await collection.findOne({ docID });
  logDB(`findBookmarkByDocID`);
  return result;
}

export async function upVoteBookmark(
  docID: string,
  voterDID: string
): Promise<void> {
  const collection = await db.collection('bookmarks');
  const result = await collection.updateOne(
    { docID },
    {
      $addToSet: { upVotes: voterDID },
      $pull: { downVotes: { $in: [voterDID] } },
    }
  );
  logDB(`upVoteBookmark: ${result.modifiedCount} document updated.`);
}

export async function downVoteBookmark(
  docID: string,
  voterDID: string
): Promise<void> {
  const collection = await db.collection('bookmarks');
  const result = await collection.updateOne(
    { docID },
    {
      $addToSet: { downVotes: voterDID },
      $pull: { upVotes: { $in: [voterDID] } },
    }
  );
  logDB(`downVoteBookmark: ${result.modifiedCount} document updated.`);
}

export async function incrementNumOfShares(docID: string): Promise<void> {
  const collection = await db.collection('bookmarks');
  const result = await collection.updateOne(
    { docID },
    { $inc: { numOfShares: 1 } }
  );
  logDB(`incrementNumOfShares: ${result.modifiedCount} document updated.`);
}

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
  logDB(
    `upsertBookmark: ${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount}, upserted ${result.upsertedCount} document(s)`
  );
  return;
}

export async function findAllBookmarks(
  filter: any = {},
  sort: any = {}
): Promise<Bookmark[]> {
  const collection = await db.collection('bookmarks');
  const cursor = await collection.aggregate([
    { $match: filter },
    {
      $addFields: {
        totalNumVotes: {
          $sum: [{ $size: '$upVotes' }, { $size: '$downVotes' }],
        },
      },
    },
    {
      $sort: sort,
    },
  ]);
  logDB(`findAllBookmarks`);
  return await cursor.toArray();
}

export async function insertManyBookmarks(
  bookmarks: Bookmark[]
): Promise<void> {
  const collection = await db.collection('bookmarks');
  const result = await collection.insertMany(bookmarks, { ordered: true });
  logDB(`insertManyBookmarks: ${result.insertedCount} document(s) inserted`);
  return;
}
//#endregion
