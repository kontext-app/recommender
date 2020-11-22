import { IDX } from '@ceramicstudio/idx';
import { definitions, schemas } from '@ceramicstudio/idx-constants';
import CeramicClient from '@ceramicnetwork/ceramic-http-client';

import {
  PUBLISHED_DEFINITIONS,
  PUBLISHED_SCHEMAS,
} from 'app/constants/definitions';
import config from 'app/config';
import {
  DefaultBookmarksIndexKeys,
  DefaultBookmarksIndexKeyType,
} from 'app/constants/bookmarks';

import type { BookmarksIndexDocContent, BookmarkDocContent } from 'app/types';

export const ceramic = new CeramicClient(config.CERAMIC_API_HOST);

export let idx: IDX;

export function createIDX(): void {
  idx = new IDX({
    ceramic,
    definitions: {
      ...definitions,
      ...PUBLISHED_DEFINITIONS,
    },
  });
}

export async function getBookmarksIndexDocContentOfDID(
  did: string
): Promise<BookmarksIndexDocContent | null> {
  return idx.get<BookmarksIndexDocContent>('BookmarksIndex', did);
}

export async function getBookmarksIndexDocIDOfDID(
  did: string
): Promise<string | null> {
  const idxDocContent = await idx.getIDXContent(did);

  if (!idxDocContent) {
    return null;
  }

  const bookmarksIndexDocID =
    idxDocContent[PUBLISHED_DEFINITIONS.BookmarksIndex];
  return bookmarksIndexDocID;
}

export async function getBookmarksCollectionDocIDByIndexKeyOfDID(
  did: string,
  indexKey: DefaultBookmarksIndexKeyType
): Promise<string | null> {
  const bookmarksIndexDocContent = await getBookmarksIndexDocContentOfDID(did);

  if (!bookmarksIndexDocContent) {
    return null;
  }

  return bookmarksIndexDocContent[indexKey];
}

export async function getBookmarksCollectionDocContent(
  docID: string
): Promise<Array<string>> {
  const bookmarksCollectionDoc = await ceramic.loadDocument(docID);

  await ceramic.close();

  return bookmarksCollectionDoc.content;
}

export async function getBookmarksCollectionByIndexKey(
  did: string,
  indexKey: DefaultBookmarksIndexKeyType
): Promise<{
  userDID: string;
  indexKey: string;
  bookmarkDocIDs: string[];
  docID: string;
} | null> {
  const bookmarksCollectionDocID = await getBookmarksCollectionDocIDByIndexKeyOfDID(
    did,
    indexKey
  );

  if (!bookmarksCollectionDocID) {
    return null;
  }

  const bookmarkDocIDs = await getBookmarksCollectionDocContent(
    bookmarksCollectionDocID
  );

  return {
    userDID: did,
    indexKey,
    bookmarkDocIDs,
    docID: bookmarksCollectionDocID,
  };
}

export async function getBookmarkDocContentByDocID(
  docID: string
): Promise<BookmarkDocContent> {
  const bookmarkDoc = await ceramic.loadDocument(docID);

  await ceramic.close();

  return bookmarkDoc.content;
}
