import { apis, RatingDocContent } from 'kontext-common';

import config from 'app/config';

import type { IDX } from '@ceramicstudio/idx';
import type { CeramicApi } from '@ceramicnetwork/common';
import type {
  BookmarksIndexDocContent,
  BookmarkDocContent,
  DefaultBookmarksIndexKey,
} from 'kontext-common';

let idx: IDX;
let ceramic: CeramicApi;

function initializeCeramic(): void {
  // @ts-ignore
  ceramic = apis.ceramic.createCeramic(config.CERAMIC_API_HOST, {
    docSyncEnabled: true,
    docSyncInterval: config.SYNC_INTERVAL,
  });
}

function initializeIDX(ceramic: CeramicApi): void {
  // @ts-ignore
  idx = apis.idx.createIDX(ceramic);
}

export function initialize(): void {
  initializeCeramic();
  initializeIDX(ceramic);
}

export async function getBookmarksIndexDocContent(
  did: string
): Promise<BookmarksIndexDocContent | null> {
  return apis.bookmarks.getBookmarksIndexDocContent(idx, did);
}

export async function getBookmarksIndexDocID(
  did: string
): Promise<string | null> {
  return apis.bookmarks.getBookmarksIndexDocID(idx, did);
}

export async function getBookmarksDocIDByIndexKey(
  did: string,
  indexKey: DefaultBookmarksIndexKey
): Promise<string | null> {
  return apis.bookmarks.getBookmarksDocIDByIndexKey(idx, { indexKey, did });
}

export async function getBookmarksCollectionDocContent(
  docID: string
): Promise<Array<string>> {
  return apis.bookmarks.getBookmarksDocContent(idx, docID);
}

export async function getBookmarksCollectionByIndexKey(
  did: string,
  indexKey: DefaultBookmarksIndexKey
): Promise<{
  userDID: string;
  indexKey: string;
  bookmarkDocIDs: string[];
  docID: string;
} | null> {
  return apis.bookmarks.getBookmarksOfCollectionByIndexKey(idx, {
    did,
    indexKey,
  });
}

export async function getBookmarkDocContentByDocID(
  docID: string
): Promise<BookmarkDocContent> {
  return apis.bookmarks.getBookmarkDocContent(idx, docID);
}

//#region 'Ratings'

export async function getRatingDocIDsOfIndexKey(
  indexKey: string,
  did: string
): Promise<string[] | null> {
  const ratingsIndexDocContent = await apis.ratings.getRatingsIndexDocContent(
    idx,
    did
  );

  if (!ratingsIndexDocContent) {
    return null;
  }

  const ratingDocIDs = ratingsIndexDocContent[indexKey];

  if (!ratingDocIDs) {
    return null;
  }

  return ratingDocIDs;
}

export async function getRatingDocContent(
  docID: string
): Promise<RatingDocContent> {
  return apis.ratings.getRatingDocContent(idx, docID);
}

//#endregion 'Ratings'
