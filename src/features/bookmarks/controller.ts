import * as bookmarksService from 'features/bookmarks/service';
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
    const popularBookmarks = await bookmarksService.getMostPopularBookmarks(
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
    const recentBookmarks = await bookmarksService.getMostRecentBookmarks(
      timeFilter as string
    );
    res.status(200).json(recentBookmarks);
  } catch (error) {
    res.status(400).json(error.message);
  }
}

export type VoteBody = {
  did: string;
  bookmarkDocID: string;
};

const VoteBodySchema = {
  type: 'object',
  properties: {
    bookmarkDocID: {
      type: 'string',
      pattern: '^ceramic://.+(\\?version=.+)?',
    },
    // TODO: add signature
    did: { type: 'string' },
  },
  required: ['bookmarkDocID', 'did'],
};

export async function upVoteBookmark(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const isVoteBodyValid = validate<VoteBody>(VoteBodySchema, req.body);

    if (!isVoteBodyValid) {
      throwValidationError();
    }

    // TODO: verify did signature
    const { did, bookmarkDocID } = req.body;

    await bookmarksService.upVoteBookmark(bookmarkDocID, did);
    res.status(200).send();
  } catch (error) {
    res.status(400).json(error.message);
  }
}

export async function downVoteBookmark(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const isVoteBodyValid = validate<VoteBody>(VoteBodySchema, req.body);

    if (!isVoteBodyValid) {
      throwValidationError();
    }

    // TODO: verify did signature
    const { did, bookmarkDocID } = req.body;

    await bookmarksService.downVoteBookmark(bookmarkDocID, did);
    res.status(200).send();
  } catch (error) {
    res.status(400).json(error.message);
  }
}

export async function shareBookmark(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const isVoteBodyValid = validate<VoteBody>(VoteBodySchema, req.body);

    if (!isVoteBodyValid) {
      throwValidationError();
    }

    // TODO: verify did signature
    const { did, bookmarkDocID } = req.body;

    await bookmarksService.shareBookmark(bookmarkDocID);
    res.status(200).send();
  } catch (error) {
    res.status(400).json(error.message);
  }
}
