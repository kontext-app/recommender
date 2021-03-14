import { utils } from 'ethers';
import { definitions, enums } from 'kontext-common';

import * as ceramic from 'app/ceramic';
import * as db from 'app/db';
import config from 'app/config';
import { logIndexer } from 'app/logger';

import * as bookmarksIndexer from 'features/bookmarks/indexer';
import * as ratingsIndexer from 'features/ratings/indexer';

import type { Doctype } from '@ceramicnetwork/common';

const indexDocIDToPrevLogsLength: {
  [indexDocID: string]: number;
} = {};

let loadedIndexDocs: Doctype[] = [];

export async function startIndexer(): Promise<void> {
  logIndexer.info(
    `Starting indexer with doc sync interval ${config.SYNC_INTERVAL} ms`
  );

  await initializeIndexerIDX();

  await setIndexDocsListeners();
  setInterval(() => {
    setIndexDocsListeners();
  }, config.SYNC_INTERVAL * 5);

  setInterval(() => {
    logIndexer.debug(
      "Update index key 'bookmarks' of AggregatedRatings with new scores..."
    );
    ratingsIndexer.updateAggregatedRatingsOfIndexKeyWithNewScores(
      enums.DefaultAggregatedRatingsIndexKeys.BOOKMARKS
    );
    logIndexer.debug(
      "Index key 'bookmarks' of AggregatedRatings updated with new scores"
    );
  }, config.SYNC_INTERVAL * 10);
}

export async function initializeIndexerIDX(): Promise<void> {
  logIndexer.debug('Initialize Indexer IDX...');

  ceramic.initialize();
  logIndexer.debug(`Initialize Ceramic and IDX`);

  await ceramic.authenticateWithSeed(utils.arrayify(config.THREE_ID_SEED));
  logIndexer.debug(`Authenticate IDX with seed of indexer`);

  const [hasAggregatedRatingsIndex, hasCuratedDocsIndex] = await Promise.all([
    ceramic.hasAggregatedRatingsIndex(),
    ceramic.hasCuratedDocsIndex(),
  ]);

  if (!hasAggregatedRatingsIndex || !hasCuratedDocsIndex) {
    await Promise.all([
      ceramic.setDefaultAggregatedRatingsIndex(),
      ceramic.setDefaultCuratedDocsIndex(),
    ]);
    logIndexer.debug(
      `Set default 'AggregatedRatingsIndex' and 'CuratedDocsIndex'`
    );
  }

  logIndexer.debug('Indexer IDX initialized 🥳');
}

export async function setIndexDocsListeners(): Promise<void> {
  await clearLoadedIndexDocs();

  const subscribedDIDs = db.getDIDs();
  loadedIndexDocs = await loadIndexDocumentsOfDIDs(subscribedDIDs);

  for (const indexDoc of loadedIndexDocs) {
    indexDoc.addListener('change', () => handleIndexDocChange(indexDoc));
  }
}

export async function clearLoadedIndexDocs(): Promise<void> {
  await ceramic.close();

  for (const loadedIndexDoc of loadedIndexDocs) {
    loadedIndexDoc.removeAllListeners('change');
  }
}

export async function loadIndexDocumentsOfDIDs(
  dids: string[]
): Promise<Doctype[]> {
  logIndexer.debug(`Loading index docs of ${dids.length} did/s...`);

  const indexDocIDs = await Promise.all(
    dids
      .map((did) => {
        return [
          ceramic.getBookmarksIndexDocID(did),
          ceramic.getRatingsIndexDocID(did),
        ];
      })
      .flat()
  );

  const indexDocs = await Promise.all(
    indexDocIDs
      .filter((indexDocID) => Boolean(indexDocID))
      .map((indexDocID: any) => ceramic.loadDocument(indexDocID))
  );

  logIndexer.debug(`${indexDocs.length} index docs loaded`);

  return indexDocs;
}

function handleIndexDocChange(doc: Doctype) {
  if (indexDocIDToPrevLogsLength[doc.id.toUrl()] === doc.state.log.length) {
    return;
  }
  indexDocIDToPrevLogsLength[doc.id.toUrl()] = doc.state.log.length;

  switch (doc.metadata.family) {
    case definitions.BookmarksIndex.replace('ceramic://', ''):
      bookmarksIndexer.handleBookmarksIndexDocChange(doc);
      break;
    case definitions.RatingsIndex.replace('ceramic://', ''):
      ratingsIndexer.handleRatingsIndexDocChange(doc);
      break;
    default:
      break;
  }
}
