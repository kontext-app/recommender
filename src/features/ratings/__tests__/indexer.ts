import * as ratingsIndexer from '../indexer';
import * as ceramic from '../../../app/ceramic';

const MOCK_AGGREGATED_RATING_1 = {
  ratedDocId: 'ceramic://ratedDocId1',
  aggregatedRatingDocIds: ['ceramic://ratingDocId1'],
  aggregatedRating: 10,
};

const MOCK_RATING_1 = {
  rating: 10,
  ratedDocId: 'ceramic://ratedDocId1',
  docId: 'ceramic://ratingDocId1',
};

const MOCK_RATING_2 = {
  rating: 5,
  ratedDocId: 'ceramic://ratedDocId1',
  docId: 'ceramic://ratingDocId2',
};

const MOCK_RATINGS = [MOCK_RATING_1, MOCK_RATING_2];

jest.mock('app/logger');
jest.mock('app/ceramic', () => ({
  getRatingDocContent: (docID: string) =>
    Promise.resolve(MOCK_RATINGS.find((rating) => rating.docId === docID)),
  getAggregatedRatingsDocContentByIndexKey: () => ({
    [MOCK_AGGREGATED_RATING_1.ratedDocId]: MOCK_AGGREGATED_RATING_1,
  }),
  getAggregatedRatingsDocIDByIndexKey: () => 'ceramic://',
  updateAggregatedRatingsDoc: (docID: string, change: any) => ({
    ...change,
  }),
}));

describe('ratings indexer', () => {
  describe('#updateAggregatedRatingsOfIndexKeyWithRatingDocIDs()', () => {
    it('should update aggregatedRatingDocIds', async () => {
      const updatedContent = await ratingsIndexer.updateAggregatedRatingsOfIndexKeyWithRatingDocIDs(
        [MOCK_RATING_1.docId, MOCK_RATING_2.docId],
        'indexKey'
      );

      expect(updatedContent).toMatchObject({
        [MOCK_AGGREGATED_RATING_1.ratedDocId]: {
          ...MOCK_AGGREGATED_RATING_1,
          aggregatedRatingDocIds: [MOCK_RATING_1.docId, MOCK_RATING_2.docId],
        },
      });
    });
  });
});
