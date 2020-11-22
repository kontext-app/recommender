import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';

import config from 'app/config';
import bookmarksRouter from 'features/bookmarks/router';
import usersRouter from 'features/users/router';

const app = express();

export function startRecommender(): void {
  app.use(morgan('dev'));

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use('/api/v1/bookmarks', bookmarksRouter);
  app.use('/api/v1/users', usersRouter);

  app.listen(config.PORT, () => {
    console.log(
      `⚡️[recommender]: Recommender service is running at https://localhost:${config.PORT}`
    );
  });
}
