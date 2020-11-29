import { findAllBookmarks } from 'app/db';
import { convertTimeFilterToEndIntervalISOString } from 'features/bookmarks/utils';

import type { Bookmark } from 'app/db';

type TimeFilter = 'all' | 'year' | 'month' | 'week' | 'day' | string;

export async function getMostPopularBookmarks(
  timeFilter: TimeFilter
): Promise<Bookmark[]> {
  const endIntervalISOString = convertTimeFilterToEndIntervalISOString(
    timeFilter
  );
  return findAllBookmarks(
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
  return findAllBookmarks(
    { creationDate: { $gte: endIntervalISOString } },
    { creationDate: -1 }
  );
}
