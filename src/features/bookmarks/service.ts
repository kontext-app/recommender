import * as db from 'app/db';
import { convertTimeFilterToEndIntervalISOString } from 'features/bookmarks/utils';

import type { Bookmark } from 'app/db';

type TimeFilter = 'all' | 'year' | 'month' | 'week' | 'day' | string;

export async function getMostPopularBookmarks(
  timeFilter: TimeFilter
): Promise<Bookmark[]> {
  const endIntervalISOString = convertTimeFilterToEndIntervalISOString(
    timeFilter
  );
  return db.findAllBookmarks(
    { creationDate: { $gte: endIntervalISOString } },
    { totalNumVotes: -1 }
  );
}

export async function getMostRecentBookmarks(
  timeFilter: TimeFilter
): Promise<Bookmark[]> {
  const endIntervalISOString = convertTimeFilterToEndIntervalISOString(
    timeFilter
  );
  return db.findAllBookmarks(
    { creationDate: { $gte: endIntervalISOString } },
    { creationDate: -1 }
  );
}

export async function upVoteBookmark(
  bookmarkDocID: string,
  voterDID: string
): Promise<void> {
  return db.upVoteBookmark(bookmarkDocID, voterDID);
}

export async function downVoteBookmark(
  bookmarkDocID: string,
  voterDID: string
): Promise<void> {
  return db.downVoteBookmark(bookmarkDocID, voterDID);
}

export async function shareBookmark(bookmarkDocID: string): Promise<void> {
  return db.incrementNumOfShares(bookmarkDocID);
}
