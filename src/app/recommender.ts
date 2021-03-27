import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import cors from 'cors';
import * as rfs from 'rotating-file-stream';
import path from 'path';

import config from 'app/config';
import { logRecommender } from 'app/logger';

import bookmarksRouter from 'features/bookmarks/router';
import ratingsRouter from 'features/ratings/router';
import usersRouter from 'features/users/router';

const app = express();

export function startRecommender(): void {
  if (process.env.NODE_ENV === 'production') {
    app.use(
      morgan('combined', {
        stream: rfs.createStream('recommender-access.log', {
          interval: '1d',
          path: path.join(__dirname, '/../../logs'),
        }),
      })
    );
  } else {
    app.use(morgan('dev'));
  }

  app.use(
    cors(
      process.env.NODE_ENV === 'production'
        ? { origin: ['http://app.kontext.app', 'https://app.kontext.app'] }
        : { origin: '*' }
    )
  );

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.use('/api/v1/bookmarks', bookmarksRouter);
  app.use('/api/v1/ratings', ratingsRouter);
  app.use('/api/v1/users', usersRouter);

  app.listen(config.PORT, () => {
    logRecommender.info(
      `Recommender service is running at http://localhost:${config.PORT}`
    );
  });
}
