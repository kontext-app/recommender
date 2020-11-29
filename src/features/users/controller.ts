import {
  subscribeToRecommender,
  unsubscribeFromRecommender,
} from 'features/users/service';
import { validate, throwValidationError } from 'app/utils/validate';

import type { Request, Response } from 'express';

type DIDBody = {
  did: string;
};

const DIDBodySchema = {
  type: 'object',
  properties: {
    // TODO: add signature
    did: { type: 'string' },
  },
  required: ['did'],
};

export async function subscribe(req: Request, res: Response): Promise<void> {
  try {
    const isReqBodyValid = validate<DIDBody>(DIDBodySchema, req.body);

    if (!isReqBodyValid) {
      throwValidationError();
    }
    // TODO: verify did signature
    const { did } = req.body;
    await subscribeToRecommender(did);
    res.status(200).send();
  } catch (error) {
    res.status(400).json(error.message);
  }
}

export async function unsubscribe(req: Request, res: Response): Promise<void> {
  try {
    const isReqBodyValid = validate<DIDBody>(DIDBodySchema, req.body);

    if (!isReqBodyValid) {
      throwValidationError();
    }
    // TODO: verify did signature
    const { did } = req.body;
    await unsubscribeFromRecommender(did);
    res.status(200).send();
  } catch (error) {
    res.status(400).json(error.message);
  }
}
