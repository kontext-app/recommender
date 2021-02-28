import express from 'express';

import * as bookmarksController from 'features/bookmarks/controller';

const router = express.Router();

router.get(
  '/curated-bookmarks-doc-id',
  bookmarksController.getCuratedBookmarkDocsDocID
);

export default router;
