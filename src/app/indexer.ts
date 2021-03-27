import { utils } from 'ethers';

import * as ceramic from 'app/ceramic';
import config from 'app/config';
import { logIndexer } from 'app/logger';

import * as bookmarksIndexer from 'features/bookmarks/indexer';
import * as ratingsIndexer from 'features/ratings/indexer';

export function startIndexer(): void {
  bookmarksIndexer.startBookmarksIndexer();
  ratingsIndexer.startRatingsIndexer();
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
