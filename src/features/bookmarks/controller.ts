import {
  getMostPopularBookmarks,
  getMostRecentBookmarks,
} from 'features/bookmarks/service';
import { validate, throwValidationError } from 'app/utils/validate';

import type { Request, Response } from 'express';

type FilterQueryParams = {
  timeFilter?: 'all' | 'year' | 'month' | 'week' | 'day';
};

const FilterQueryParamsSchema = {
  type: 'object',
  properties: {
    timeFilter: { type: 'string' },
  },
  required: [],
};

export async function getPopularBookmarks(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const areQueryParamsValid = validate<FilterQueryParams>(
      FilterQueryParamsSchema,
      req.query
    );

    if (!areQueryParamsValid) {
      throwValidationError();
    }
    const { timeFilter = 'all' } = req.query;
    const popularBookmarks = await getMostPopularBookmarks(
      timeFilter as string
    );
    res.status(200).json(popularBookmarks);
  } catch (error) {
    res.status(400).json(error.message);
  }
}

export async function getRecentBookmarks(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const areQueryParamsValid = validate<FilterQueryParams>(
      FilterQueryParamsSchema,
      req.query
    );

    if (!areQueryParamsValid) {
      throwValidationError();
    }
    const { timeFilter = 'all' } = req.query;
    const recentBookmarks = await getMostRecentBookmarks(timeFilter as string);
    res.status(200).json(recentBookmarks);
  } catch (error) {
    res.status(400).json(error.message);
  }
}
