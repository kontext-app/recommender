import * as bookmarksIndexer from '../indexer';
import * as ceramic from 'app/ceramic';

jest.mock('app/logger');
jest.mock('app/ceramic', () => ({
  getCuratedDocsDocContent: () => ({
    curatedDocsIndexKey: ['ceramic://1'],
  }),
  updateCuratedDocsDoc: (docID: string, change: any) => ({
    ...change,
  }),
}));

describe('bookmarks indexer', () => {
  describe('#updateIndexKeyOfCuratedBookmarkDocs()', () => {
    it('should return updated content of CuratedDocsDoc', async () => {
      const updatedContent = await bookmarksIndexer.updateIndexKeyOfCuratedDocs(
        {
          curatedDocsDocID: 'ceramic://',
          curatedDocsIndexKey: 'curatedDocsIndexKey',
          docIDsToAdd: ['ceramic://2'],
        }
      );

      expect(updatedContent).toMatchObject({
        curatedDocsIndexKey: ['ceramic://1', 'ceramic://2'],
      });
    });

    it('should return unique updated content', async () => {
      const updatedContent = await bookmarksIndexer.updateIndexKeyOfCuratedDocs(
        {
          curatedDocsDocID: 'ceramic://',
          curatedDocsIndexKey: 'curatedDocsIndexKey',
          docIDsToAdd: ['ceramic://1'],
        }
      );

      expect(updatedContent).toMatchObject({
        curatedDocsIndexKey: ['ceramic://1'],
      });
    });
  });
});
