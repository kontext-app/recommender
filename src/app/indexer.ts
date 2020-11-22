import {
  createIDX,
  getBookmarksCollectionByIndexKey,
  getBookmarkDocContentByDocID,
} from 'app/ceramic';
import {
  findAllUserDIDsWithEnabledRecommendations,
  findAllBookmarksCollectionsOfDIDs,
  upsertBookmarksCollection,
  upsertBookmark,
} from 'app/db';

const SYNC_INTERVAL = 30000;

export async function startIndexer(): Promise<void> {
  createIDX();
  console.log(
    `⚡️[indexer]: Indexer started with sync interval: ${SYNC_INTERVAL}ms`
  );
  await indexBookmarks();
  setInterval(async () => {
    await indexBookmarks();
  }, SYNC_INTERVAL);
}

export async function indexBookmarks(): Promise<void> {
  console.log(`⚡️[indexer]: Start syncing...`);
  await indexPublicBookmarksCollections();
  await indexPublicBookmarks();
  console.log(`⚡️[indexer]: Syncing ended`);
}

export async function indexPublicBookmarksCollections(): Promise<void> {
  const dids = await findAllUserDIDsWithEnabledRecommendations();

  const allPublicBookmarksCollections = (
    await Promise.all(
      dids.map((did) => getBookmarksCollectionByIndexKey(did, 'public'))
    )
  ).filter(
    (
      collection
    ): collection is {
      userDID: string;
      indexKey: string;
      bookmarkDocIDs: string[];
      docID: string;
    } => !!collection
  );

  await Promise.all(
    allPublicBookmarksCollections.map((bookmarksCollection) =>
      upsertBookmarksCollection(bookmarksCollection)
    )
  );
}

export async function indexPublicBookmarks(): Promise<void> {
  const dids = await findAllUserDIDsWithEnabledRecommendations();
  const allIndexedPublicBookmarksCollections = await findAllBookmarksCollectionsOfDIDs(
    dids,
    'public'
  );

  for (const indexedPublicBookmarksCollection of allIndexedPublicBookmarksCollections) {
    const { bookmarkDocIDs } = indexedPublicBookmarksCollection;
    const bookmarks = await Promise.all(
      bookmarkDocIDs.map((docID) => getBookmarkDocContentByDocID(docID))
    );
    await Promise.all(
      bookmarks.map((bookmark, index) =>
        upsertBookmark({
          ...bookmark,
          docID: bookmarkDocIDs[index],
        })
      )
    );
  }
}
