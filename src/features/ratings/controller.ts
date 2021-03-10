import * as ratingsService from 'features/ratings/service';

import type { Request, Response } from 'express';

export async function getAggregatedBookmarkRatingsDocID(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const aggregatedBookmarkRatingsDocID = await ratingsService.getAggregatedBookmarkRatingsDocID();
    res.status(200).json(aggregatedBookmarkRatingsDocID);
  } catch (error) {
    res.status(400).json(error.message);
  }
}
