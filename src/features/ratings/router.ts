import express from 'express';

import * as ratingsController from 'features/ratings/controller';

const router = express.Router();

router.get(
  '/aggregated-bookmark-ratings-doc-id',
  ratingsController.getAggregatedBookmarkRatingsDocID
);

export default router;
