import {
  initialize,
  getBookmarksCollectionByIndexKey,
  getBookmarkDocContentByDocID,
  getRatingDocIDsOfIndexKey,
  getRatingDocContent,
} from 'app/ceramic';
import {
  findAllUserDIDsWithEnabledRecommendations,
  findAllBookmarksCollectionsOfDIDs,
  upsertBookmarksCollection,
  upsertBookmark,
  upVoteBookmark,
  downVoteBookmark,
} from 'app/db';
import config from 'app/config';
import { logIndexer } from 'app/logger';

const SYNC_INTERVAL = config.SYNC_INTERVAL || 30000;

export async function startIndexer(): Promise<void> {
  initialize();
  logIndexer(`Indexer started with sync interval: ${SYNC_INTERVAL}ms\n`);
  await indexPublicBookmarksAndRatingsInterval();
}

async function indexPublicBookmarksAndRatingsInterval() {
  await indexPublicBookmarksAndRatings();
  setTimeout(indexPublicBookmarksAndRatingsInterval, SYNC_INTERVAL);
}

async function indexPublicBookmarksAndRatings(): Promise<void> {
  logIndexer(`Start indexing Bookmarks...`);
  await indexBookmarks();
  logIndexer(`Ended indexing Bookmarks.\n`);
  logIndexer(`Start indexing Ratings...`);
  await indexPublicBookmarkRatings();
  logIndexer(`Ended indexing Ratings.\n`);
}

export async function indexPublicBookmarkRatings(): Promise<void> {
  const dids = await findAllUserDIDsWithEnabledRecommendations();
  logIndexer(`Indexing public ratings of ${dids.length} dids`);

  const ratingDocIDs = await Promise.all(
    dids.map((did) => getRatingDocIDsOfIndexKey('bookmarks', did))
  );
  const flattenedRatingDocIDs = ratingDocIDs
    .flat()
    .filter(
      (ratingDocID): ratingDocID is string => typeof ratingDocID === 'string'
    );

  const ratingDocContents = await Promise.all(
    flattenedRatingDocIDs.map((ratingDocID) => getRatingDocContent(ratingDocID))
  );

  const bookmarkDocIDToVotesMap = ratingDocContents.reduce(
    (
      map: {
        [bookmarkDocID: string]: {
          upVotedDIDs: string[];
          downVotedDIDs: string[];
        };
      },
      ratingDocContent
    ) => {
      const { ratedDocId, rating, author } = ratingDocContent;

      const { upVotedDIDs = [], downVotedDIDs = [] } = map[ratedDocId] || {};

      if (rating === 1) {
        return {
          ...map,
          [ratedDocId]: {
            upVotedDIDs: [...upVotedDIDs, author],
            downVotedDIDs,
          },
        };
      }

      if (rating === -1) {
        return {
          ...map,
          [ratedDocId]: {
            downVotedDIDs: [...downVotedDIDs, author],
            upVotedDIDs,
          },
        };
      }

      return map;
    },
    {}
  );

  // bulk up vote
  await Promise.all(
    Object.entries(bookmarkDocIDToVotesMap).map((entries) => {
      const [bookmarkDocID, votes] = entries;
      return upVoteBookmark(bookmarkDocID, votes.upVotedDIDs);
    })
  );

  // bulk down vote
  await Promise.all(
    Object.entries(bookmarkDocIDToVotesMap).map((entries) => {
      const [bookmarkDocID, votes] = entries;
      return downVoteBookmark(bookmarkDocID, votes.downVotedDIDs);
    })
  );
}

export async function indexBookmarks(): Promise<void> {
  await indexPublicBookmarksCollections();
  await indexPublicBookmarks();
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
