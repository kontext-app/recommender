import { enums } from 'kontext-common';

import * as ceramic from 'app/ceramic';
import { logIndexer } from 'app/logger';

import type {
  AggregatedRating,
  AggregatedRatingsDocContent,
  RatingsIndexDoc,
} from 'kontext-common';

const indexDocIDToPrevItemsLength: {
  [indexDocID: string]: number;
} = {};

export async function handleRatingsIndexDocChange(
  doc: RatingsIndexDoc
): Promise<void> {
  const prevItemsLength = indexDocIDToPrevItemsLength[doc.id.toUrl()] || 0;
  if (prevItemsLength >= doc.content.bookmarks.length) {
    return;
  }
  indexDocIDToPrevItemsLength[doc.id.toUrl()] = doc.content.bookmarks.length;

  logIndexer(
    `Index key 'bookmarks' of RatingsIndex from ${doc.metadata.controllers} changed`
  );

  const aggregatedRatingsIndexDocID = await ceramic.getAggregatedRatingsIndexDocID();

  if (!aggregatedRatingsIndexDocID) {
    logIndexer('Error: AggregatedRatingsIndex doc not found!');
    return;
  }

  const bookmarksRatingDocIDs = doc.content.bookmarks;

  await updateAggregatedRatingsOfIndexKeyWithRatingDocIDs(
    bookmarksRatingDocIDs,
    enums.DefaultAggregatedRatingsIndexKeys.BOOKMARKS
  );
}

export async function updateAggregatedRatingsOfIndexKeyWithRatingDocIDs(
  ratingDocIDs: string[],
  indexKey: string
): Promise<AggregatedRatingsDocContent> {
  logIndexer(
    `Updating aggregatedRatingDocIds of '${indexKey}' index key AggregatedRatings...`
  );

  const aggregatedRatingsDocContent = await ceramic.getAggregatedRatingsDocContentByIndexKey(
    indexKey
  );
  const aggregatedRatingsDocContentChange: AggregatedRatingsDocContent = {};
  const getRatingDocSettledResults = await Promise.allSettled(
    ratingDocIDs.map((docID) => ceramic.getRatingDocContent(docID))
  );

  for (const [index, result] of getRatingDocSettledResults.entries()) {
    if (result.status === 'fulfilled') {
      const { value } = result;
      const ratingDocID = ratingDocIDs[index];
      const { ratedDocId } = value;

      const existingAggregatedRatingForRatedDocID =
        aggregatedRatingsDocContent[ratedDocId];

      if (
        existingAggregatedRatingForRatedDocID?.aggregatedRatingDocIds.includes(
          ratingDocID
        )
      ) {
        continue;
      }

      const updatedAggregatedRatingDocIDs = [
        ...existingAggregatedRatingForRatedDocID.aggregatedRatingDocIds,
        ratingDocID,
      ];
      aggregatedRatingsDocContentChange[ratedDocId] = {
        ...existingAggregatedRatingForRatedDocID,
        aggregatedRatingDocIds: updatedAggregatedRatingDocIDs,
      };
    }
  }

  const aggregatedRatingsDocID = await ceramic.getAggregatedRatingsDocIDByIndexKey(
    indexKey
  );
  const updatedContent = await ceramic.updateAggregatedRatingsDoc(
    aggregatedRatingsDocID,
    aggregatedRatingsDocContentChange
  );

  logIndexer(
    `AggregatedRatingDocIds of '${indexKey}' index key AggregatedRatings updated`
  );

  return updatedContent;
}

export async function updateAggregatedRatingsOfIndexKeyWithNewScores(
  indexKey: string
): Promise<AggregatedRatingsDocContent> {
  logIndexer(
    `Updating aggregatedRatings of '${indexKey}' index key AggregatedRatings...`
  );

  const aggregatedRatingsDocContent = await ceramic.getAggregatedRatingsDocContentByIndexKey(
    indexKey
  );
  const aggregatedRatings = Object.values(aggregatedRatingsDocContent);

  const scoresOfAggregatedRatings = await Promise.all(
    aggregatedRatings.map((aggregatedRating) =>
      calculateScoreOfAggregatedRating(aggregatedRating)
    )
  );

  const aggregatedRatingsWithNewScores: AggregatedRatingsDocContent = aggregatedRatings.reduce(
    (acc, curr, i) => ({
      ...acc,
      [curr.ratedDocId]: {
        ...curr,
        aggregatedRating: scoresOfAggregatedRatings[i],
      },
    }),
    {}
  );

  const aggregatedRatingsDocID = await ceramic.getAggregatedRatingsDocIDByIndexKey(
    indexKey
  );
  const updatedContent = await ceramic.updateAggregatedRatingsDoc(
    aggregatedRatingsDocID,
    aggregatedRatingsWithNewScores
  );

  logIndexer(`AggregatedRatings of index key '${indexKey}' updated`);

  return updatedContent;
}

export async function calculateScoreOfAggregatedRating(
  aggregatedRating: AggregatedRating
): Promise<number> {
  const ratingDocContents = await Promise.all(
    aggregatedRating.aggregatedRatingDocIds.map((docID) =>
      ceramic.getRatingDocContent(docID)
    )
  );

  const ratingSum = ratingDocContents.reduce(
    (sum, ratingDocContent) => (ratingDocContent.rating += sum),
    0
  );

  return ratingSum;
}