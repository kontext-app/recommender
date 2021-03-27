import { uniq, difference } from 'lodash';

import * as ceramic from 'app/ceramic';
import { logIndexer } from 'app/logger';
import config from 'app/config';
import * as db from 'app/db';

import type {
  AggregatedRatingsDocContent,
  RatingsIndexDoc,
} from 'kontext-common';

export async function startRatingsIndexer(): Promise<void> {
  await indexBookmarkRatings();
  setTimeout(() => startRatingsIndexer(), config.SYNC_INTERVAL);
}

export async function indexBookmarkRatings(): Promise<void> {
  logIndexer.debug('Start indexing bookmark ratings...');

  const aggregatedRatingsIndexDocID = await ceramic.getAggregatedRatingsIndexDocID();

  if (!aggregatedRatingsIndexDocID) {
    throw new Error('Error: AggregatedRatingsIndex doc not found!');
  }

  const alreadyAggregatedRatingDocIDs = await getAlreadyAggregatedRatingDocIDs();
  const mergedBookmarkRatingDocIDsOfDIDs = await getMergedBookmarkRatingDocIDsOfDIDs();

  const diff = difference(
    mergedBookmarkRatingDocIDsOfDIDs,
    alreadyAggregatedRatingDocIDs
  );

  if (diff.length > 0) {
    logIndexer.debug(
      `Updating aggregated bookmark ratings with ${diff.length} doc ids...`
    );
    await updateAggregatedRatingsOfIndexKeyWithRatingDocIDs(diff, 'bookmarks');
  }

  logIndexer.debug('Done indexing bookmark ratings');
}

export async function getAlreadyAggregatedRatingDocIDs(): Promise<string[]> {
  const aggregatedBookmarkRatingsDocContent = await ceramic.getAggregatedRatingsDocContentByIndexKey(
    'bookmarks'
  );

  const alreadyAggregatedRatingDocIDs = Object.values(
    aggregatedBookmarkRatingsDocContent
  )
    .map((aggregatedRating) => aggregatedRating.aggregatedRatingDocIds)
    .flat();

  return uniq(alreadyAggregatedRatingDocIDs);
}

export async function getMergedBookmarkRatingDocIDsOfDIDs(): Promise<string[]> {
  const subscribedDIDs = db.getDIDs();

  const ratingsIndexDocsOfDIDs = await getRatingsIndexDocsOfDIDs(
    subscribedDIDs
  );

  const mergedBookmarkRatingDocIDsOfDIDs = uniq(
    ratingsIndexDocsOfDIDs
      .map((ratingsIndexDoc) => ratingsIndexDoc.content.bookmarks)
      .flat()
  );

  return mergedBookmarkRatingDocIDsOfDIDs;
}

export async function getRatingsIndexDocsOfDIDs(
  dids: string[]
): Promise<RatingsIndexDoc[]> {
  const indexDocIDs = await Promise.all(
    dids.map((did) => ceramic.getRatingsIndexDocID(did))
  );

  const indexDocs = await Promise.all(
    indexDocIDs
      .filter((indexDocID) => Boolean(indexDocID))
      .map((indexDocID: any) => ceramic.loadDocument(indexDocID))
  );

  return indexDocs;
}

export async function updateAggregatedRatingsOfIndexKeyWithRatingDocIDs(
  ratingDocIDs: string[],
  indexKey: string
): Promise<AggregatedRatingsDocContent> {
  const aggregatedRatingsDocContent = await ceramic.getAggregatedRatingsDocContentByIndexKey(
    indexKey
  );
  const aggregatedRatingsDocContentChange: AggregatedRatingsDocContent = {};
  const ratingDocContents = await Promise.all(
    ratingDocIDs.map((docID) => ceramic.getRatingDocContent(docID))
  );

  for (const [index, ratingDocContent] of ratingDocContents.entries()) {
    const ratingDocID = ratingDocIDs[index];
    const { ratedDocId, rating } = ratingDocContent;

    const aggregatedRatingForRatedDocID = aggregatedRatingsDocContent[
      ratedDocId
    ] || {
      ratedDocId,
      aggregatedRating: 0,
      aggregatedRatingDocIds: [],
    };

    if (
      aggregatedRatingForRatedDocID?.aggregatedRatingDocIds.includes(
        ratingDocID
      )
    ) {
      continue;
    }

    const updatedAggregatedRatingDocIDs = [
      ...aggregatedRatingForRatedDocID.aggregatedRatingDocIds,
      ratingDocID,
    ];

    aggregatedRatingsDocContentChange[ratedDocId] = {
      ratedDocId,
      aggregatedRatingDocIds: updatedAggregatedRatingDocIDs,
      aggregatedRating: aggregatedRatingForRatedDocID.aggregatedRating + rating,
    };
  }

  const aggregatedRatingsDocID = await ceramic.getAggregatedRatingsDocIDByIndexKey(
    indexKey
  );
  const updatedContent = await ceramic.updateAggregatedRatingsDoc(
    aggregatedRatingsDocID,
    aggregatedRatingsDocContentChange
  );

  return updatedContent;
}
