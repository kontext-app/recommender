import {
  initialize,
  getBookmarksCollectionByIndexKey,
  getBookmarkDocContentByDocID,
} from 'app/ceramic';
import {
  findAllUserDIDsWithEnabledRecommendations,
  findAllBookmarksCollectionsOfDIDs,
  upsertBookmarksCollection,
  upsertBookmark,
} from 'app/db';
import config from 'app/config';
import { logIndexer } from 'app/logger';

const SYNC_INTERVAL = config.SYNC_INTERVAL || 30000;

export async function startIndexer(): Promise<void> {
  initialize();
  logIndexer(`Indexer started with sync interval: ${SYNC_INTERVAL}ms`);
  await indexBookmarks();
  setInterval(async () => {
    await indexBookmarks();
  }, SYNC_INTERVAL);
}

export async function indexBookmarks(): Promise<void> {
  logIndexer(`Start syncing...`);
  await indexPublicBookmarksCollections();
  await indexPublicBookmarks();
  logIndexer(`Syncing ended`);
}

export async function indexPublicBookmarksCollections(): Promise<void> {
  const dids = await findAllUserDIDsWithEnabledRecommendations();
  logIndexer(`Indexing public bookmark collections of ${dids.length} dids`);

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
