import express from 'express';

import * as bookmarksController from 'features/bookmarks/controller';

const router = express.Router();

router.get('/popular', bookmarksController.getPopularBookmarks);
router.get('/recent', bookmarksController.getRecentBookmarks);
router.put('/up-vote', bookmarksController.upVoteBookmark); // TODO
router.put('/down-vote', bookmarksController.downVoteBookmark); // TODO
router.put('/share', bookmarksController.shareBookmark); // TODO

export default router;
