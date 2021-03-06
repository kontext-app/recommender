import * as bookmarksService from 'features/bookmarks/service';
import { cache } from 'app/cache';

import type { Request, Response } from 'express';

export async function getCuratedBookmarkDocsDocID(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const curatedBookmarkDocsDocID = cache.has('curatedBookmarkDocsDocID')
      ? cache.get('curatedBookmarkDocsDocID')
      : await bookmarksService.getCuratedBookmarkDocsDocID();
    res.status(200).json(curatedBookmarkDocsDocID);
  } catch (error) {
    res.status(400).json(error.message);
  }
}
