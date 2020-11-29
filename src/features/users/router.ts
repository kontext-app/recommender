import express from 'express';

import * as UsersController from 'features/users/controller';

const router = express.Router();

router.put('/subscribe', UsersController.subscribe);
router.put('/unsubscribe', UsersController.unsubscribe);

export default router;
