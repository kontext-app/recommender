import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';

import config from 'app/config';
import { logRecommender } from 'app/logger';
import bookmarksRouter from 'features/bookmarks/router';
import ratingsRouter from 'features/ratings/router';
import usersRouter from 'features/users/router';

const app = express();

export function startRecommender(): void {
  app.use(morgan('dev'));
  app.use(cors());

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use('/api/v1/bookmarks', bookmarksRouter);
  app.use('/api/v1/ratings', ratingsRouter);
  app.use('/api/v1/users', usersRouter);

  app.listen(config.PORT, () => {
    logRecommender(
      `Recommender service is running at https://localhost:${config.PORT}`
    );
  });
}
