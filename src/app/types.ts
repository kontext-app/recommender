export type BookmarksIndexDocContent = {
  unsorted: string;
  public: string;
  private: string;
  lists: string;
  [key: string]: string;
};

export type BookmarkDocContent = {
  url: string;
  title: string;
  author: string;
  description: string;
  highlightedText: string;
  creationDate: string;
};
