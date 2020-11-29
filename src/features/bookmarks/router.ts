import express from 'express';

import * as BookmarksController from 'features/bookmarks/controller';

const router = express.Router();

router.get('/popular', BookmarksController.getPopularBookmarks);
router.get('/recent', BookmarksController.getRecentBookmarks);

export default router;
