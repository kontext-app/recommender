import { CuratedDocsDocContent, enums } from 'kontext-common';
import { uniq, difference } from 'lodash';

import * as db from 'app/db';
import { logIndexer } from 'app/logger';
import * as ceramic from 'app/ceramic';
import config from 'app/config';

import type { BookmarksIndexDoc } from 'kontext-common';

export async function startBookmarksIndexer(): Promise<void> {
  await indexPublicBookmarks();
  setTimeout(() => startBookmarksIndexer(), config.SYNC_INTERVAL);
}

export async function indexPublicBookmarks(): Promise<void> {
  logIndexer.debug('Start indexing public bookmarks...');

  const curatedBookmarkDocsDocID = await getCuratedBookmarkDocsDocID();
  const recentCuratedBookmarksDocIDs = await getRecentCuratedBookmarkDocIDs(
    curatedBookmarkDocsDocID
  );
  const mergedPublicBookmarkDocIDsOfDIDs = await getMergedPublicBookmarkDocIDsOfDIDs();

  const diff = difference(
    mergedPublicBookmarkDocIDsOfDIDs,
    recentCuratedBookmarksDocIDs
  );

  if (diff.length > 0) {
    logIndexer.debug(
      `Updating recent curated bookmarks with ${diff.length} doc ids...`
    );
    await updateIndexKeyOfCuratedDocs({
      curatedDocsDocID: curatedBookmarkDocsDocID,
      curatedDocsIndexKey: 'recent',
      docIDsToAdd: diff,
    });
  }

  logIndexer.debug('Done indexing public bookmarks');
}

export async function getCuratedBookmarkDocsDocID(): Promise<string> {
  const curatedDocsIndex = await ceramic.getCuratedDocsIndexDocContent();

  if (!curatedDocsIndex) {
    throw new Error('Error: CuratedDocsIndex doc not found!');
  }

  const curatedBookmarkDocsDocID =
    curatedDocsIndex[enums.DefaultCuratedDocsIndexKeys.BOOKMARKS];
  return curatedBookmarkDocsDocID;
}

export async function getRecentCuratedBookmarkDocIDs(
  curatedBookmarkDocsDocID: string
): Promise<string[]> {
  const curatedBookmarkDocsDocContent = await ceramic.getCuratedDocsDocContent(
    curatedBookmarkDocsDocID
  );
  const recentCuratedBookmarkDocIDs = curatedBookmarkDocsDocContent.recent;
  return recentCuratedBookmarkDocIDs;
}

export async function getMergedPublicBookmarkDocIDsOfDIDs(): Promise<string[]> {
  const subscribedDIDs = db.getDIDs();

  const bookmarksIndexDocsOfDIDs = await getBookmarksIndexDocsOfDIDs(
    subscribedDIDs
  );

  const mergedPublicBookmarkDocIDsOfDIDs = uniq(
    bookmarksIndexDocsOfDIDs
      .map((bookmarksIndexDoc) => bookmarksIndexDoc.content.public)
      .flat()
  );

  return mergedPublicBookmarkDocIDsOfDIDs;
}

export async function getBookmarksIndexDocsOfDIDs(
  dids: string[]
): Promise<BookmarksIndexDoc[]> {
  const indexDocIDs = await Promise.all(
    dids.map((did) => ceramic.getBookmarksIndexDocID(did))
  );

  const indexDocs = await Promise.all(
    indexDocIDs
      .filter((indexDocID) => Boolean(indexDocID))
      .map((indexDocID: any) => ceramic.loadDocument(indexDocID))
  );

  return indexDocs;
}

export async function updateIndexKeyOfCuratedDocs(params: {
  curatedDocsDocID: string;
  curatedDocsIndexKey: string;
  docIDsToAdd: string[];
}): Promise<CuratedDocsDocContent> {
  const curatedDocsDocContent = await ceramic.getCuratedDocsDocContent(
    params.curatedDocsDocID
  );
  const previousCuratedDocIDsOfIndexKey =
    curatedDocsDocContent[params.curatedDocsIndexKey];
  const mergedCuratedDocIDs = uniq([
    ...previousCuratedDocIDsOfIndexKey,
    ...params.docIDsToAdd,
  ]);
  const change = {
    [params.curatedDocsIndexKey]: mergedCuratedDocIDs,
  };

  const updatedContent = await ceramic.updateCuratedDocsDoc(
    params.curatedDocsDocID,
    change
  );
  return updatedContent;
}
