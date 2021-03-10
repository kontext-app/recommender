import {
  AggregatedRating,
  apis,
  CuratedDocsDocContent,
  CuratedDocsIndexDocContent,
  RatingDocContent,
} from 'kontext-common';
import CeramicClient from '@ceramicnetwork/http-client';

import config from 'app/config';

import type { IDX } from '@ceramicstudio/idx';
import type { Doctype } from '@ceramicnetwork/common';
import type { AggregatedRatingsDocContent } from 'kontext-common';

let idx: IDX;
let ceramic: CeramicClient;

function initializeCeramic(): void {
  ceramic = apis.ceramic.createCeramic(config.CERAMIC_API_HOST, {
    docSyncEnabled: true,
    docSyncInterval: config.SYNC_INTERVAL,
  });
}

function initializeIDX(ceramic: CeramicClient): void {
  idx = apis.idx.createIDX(ceramic);
}

export function initialize(): void {
  initializeCeramic();
  initializeIDX(ceramic);
}

export async function loadDocument(docID: string): Promise<Doctype> {
  return ceramic.loadDocument(docID);
}

//#region 3ID

export async function authenticateWithSeed(seed: Uint8Array): Promise<void> {
  const didProvider = await apis.threeId.createThreeIdFromSeed({
    ceramic,
    seed,
  });
  await apis.threeId.authenticate({ ceramic, didProvider });
}

//#endregion

//#region Aggregated

export async function getAggregatedRatingsIndexDocID(): Promise<string | null> {
  return apis.aggregatedRatings.getAggregatedRatingsIndexDocID(idx);
}

export async function hasAggregatedRatingsIndex(): Promise<boolean> {
  return apis.aggregatedRatings.hasAggregatedRatingsIndex(idx);
}

export async function setDefaultAggregatedRatingsIndex(): Promise<string> {
  return apis.aggregatedRatings.setDefaultAggregatedRatingsIndex(idx);
}

export async function getAggregatedRatingsDocContentByIndexKey(
  indexKey: string
): Promise<AggregatedRatingsDocContent> {
  return apis.aggregatedRatings.getAggregatedRatingsDocContentByIndexKey(
    idx,
    indexKey
  );
}

export async function getAggregatedRatingsDocIDByIndexKey(
  indexKey: string
): Promise<string> {
  return apis.aggregatedRatings.getAggregatedRatingsDocIDByIndexKey(
    idx,
    indexKey
  );
}

export async function addAggregatedRatingToIndex(
  aggregatedRatingToAdd: AggregatedRating,
  indexKey: string
): Promise<AggregatedRating> {
  return apis.aggregatedRatings.addAggregatedRatingToIndex(idx, {
    aggregatedRatingToAdd,
    indexKey,
  });
}

export async function updateAggregatedRatingsDoc(
  aggregatedRatingsDocID: string,
  change: Partial<AggregatedRatingsDocContent>
): Promise<AggregatedRatingsDocContent> {
  return apis.aggregatedRatings.updateAggregatedRatingsDoc(idx, {
    aggregatedRatingsDocID,
    change,
  });
}

//#endregion

//#region Curated

export async function hasCuratedDocsIndex(): Promise<boolean> {
  return apis.curatedDocs.hasCuratedDocsIndex(idx);
}

export async function setDefaultCuratedDocsIndex(): Promise<string> {
  return apis.curatedDocs.setDefaultCuratedDocsIndex(idx);
}

export async function getCuratedDocsIndexDocContent(): Promise<CuratedDocsIndexDocContent | null> {
  return apis.curatedDocs.getCuratedDocsIndexDocContent(idx);
}

export async function getCuratedDocsDocContent(
  docID: string
): Promise<CuratedDocsDocContent> {
  return apis.curatedDocs.getCuratedDocsDocContent(idx, docID);
}

export async function createCuratedDocsDoc(
  curatedDocsDoc: CuratedDocsDocContent
): Promise<string> {
  return apis.curatedDocs.createCuratedDocsDoc(idx, curatedDocsDoc);
}

export async function addDocToCuratedDocKey(
  docID: string,
  curatedDocsDocID: string,
  indexKey: string
): Promise<CuratedDocsDocContent> {
  return apis.curatedDocs.addDocToCuratedDocsKey(idx, {
    docID,
    curatedDocsDocID,
    indexKey,
  });
}

export async function updateCuratedDocsDoc(
  curatedDocsDocID: string,
  change: Partial<CuratedDocsDocContent>
): Promise<CuratedDocsDocContent> {
  return apis.curatedDocs.updateCuratedDocsDoc(idx, {
    curatedDocsDocID,
    change,
  });
}

export async function getCuratedDocsIndexDocID(): Promise<string | null> {
  return apis.curatedDocs.getCuratedDocsIndexDocID(idx);
}

//#endregion

export async function getBookmarksIndexDocID(
  did: string
): Promise<string | null> {
  return apis.bookmarks.getBookmarksIndexDocID(idx, did);
}

//#region 'Ratings'

export async function getRatingsIndexDocID(
  did: string
): Promise<string | null> {
  return apis.ratings.getRatingsIndexDocID(idx, did);
}

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
