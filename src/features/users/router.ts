import express from 'express';

import { subscribeToRecommender } from 'features/users/service';

import { validateObject } from 'app/utils/validate';

const router = express.Router();

router.get('/', function (req, res) {
  res.send('users');
});

router.put('/subscribe', async (req, res) => {
  const schema = {
    type: 'object',
    properties: {
      did: { type: 'string' },
    },
    required: ['did'],
  };

  try {
    // TODO: provide did signature and validate
    validateObject(schema, req.body);
    const { did } = req.body;
    await subscribeToRecommender(did);
    res.status(200).send();
  } catch (error) {
    res.status(400).json(error.message);
  }
});

export default router;
