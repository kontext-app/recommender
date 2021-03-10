import * as ceramic from 'app/ceramic';

export async function getAggregatedBookmarkRatingsDocID(): Promise<
  string | null
> {
  const aggregatedBookmarkRatingsDocID = await ceramic.getAggregatedRatingsDocIDByIndexKey(
    'bookmarks'
  );
  return aggregatedBookmarkRatingsDocID;
}
