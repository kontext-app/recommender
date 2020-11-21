import express from 'express';
import morgan from 'morgan';

import config from 'app/config';
import bookmarksRouter from 'features/bookmarks/router';
import usersRouter from 'features/users/router';

const app = express();

export function startRecommender(): void {
  app.use(morgan('dev'));
  app.use('/bookmarks', bookmarksRouter);
  app.use('/users', usersRouter);

  app.listen(config.PORT, () => {
    console.log(
      `⚡️[recommender]: Recommender service is running at https://localhost:${config.PORT}`
    );
  });
}
