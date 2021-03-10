import * as ceramic from 'app/ceramic';

export async function getCuratedBookmarkDocsDocID(): Promise<string | null> {
  const curatedDocsIndexDocContent = await ceramic.getCuratedDocsIndexDocContent();

  if (!curatedDocsIndexDocContent) {
    return null;
  }

  const curatedBookmarkDocsDocID = curatedDocsIndexDocContent?.bookmarks;
  return curatedBookmarkDocsDocID;
}
