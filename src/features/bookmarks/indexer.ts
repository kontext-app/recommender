import { CuratedDocsDocContent, enums } from 'kontext-common';
import { uniq } from 'lodash';

import { logIndexer } from 'app/logger';
import * as ceramic from 'app/ceramic';

import type { BookmarksIndexDoc } from 'kontext-common';

const indexDocIDToPrevItemsLength: {
  [indexDocID: string]: number;
} = {};

export async function handleBookmarksIndexDocChange(
  doc: BookmarksIndexDoc
): Promise<void> {
  const prevItemsLength = indexDocIDToPrevItemsLength[doc.id.toUrl()] || 0;
  if (prevItemsLength >= doc.content.public.length) {
    return;
  }
  indexDocIDToPrevItemsLength[doc.id.toUrl()] = doc.content.public.length;

  logIndexer(
    `Index key 'public' of BookmarksIndex from ${doc.metadata.controllers} changed`
  );

  const curatedDocsIndex = await ceramic.getCuratedDocsIndexDocContent();

  if (!curatedDocsIndex) {
    logIndexer('Error: CuratedDocsIndex doc not found!');
    return;
  }

  const curatedBookmarkDocsDocID =
    curatedDocsIndex[enums.DefaultCuratedDocsIndexKeys.BOOKMARKS];

  logIndexer(`Updating CuratedDocsDoc 'recent' index key...`);
  await updateIndexKeyOfCuratedDocs({
    curatedDocsDocID: curatedBookmarkDocsDocID,
    docIDsOfChangedIndexDoc: doc.content.public,
    curatedDocsIndexKey: enums.DefaultCuratedDocsKeys.RECENT,
  });
  logIndexer(`Index key 'recent' of CuratedDocsDoc updated`);
}

export async function updateIndexKeyOfCuratedDocs(params: {
  curatedDocsDocID: string;
  curatedDocsIndexKey: string;
  docIDsOfChangedIndexDoc: string[];
}): Promise<CuratedDocsDocContent> {
  const curatedDocsDocContent = await ceramic.getCuratedDocsDocContent(
    params.curatedDocsDocID
  );
  const previousCuratedDocIDsOfIndexKey =
    curatedDocsDocContent[params.curatedDocsIndexKey];
  const mergedCuratedDocIDs = uniq([
    ...previousCuratedDocIDsOfIndexKey,
    ...params.docIDsOfChangedIndexDoc,
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
