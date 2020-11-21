import { startRecommender } from 'app/recommender';
import { startIndexer } from 'app/indexer';
import { connectMongoClient } from 'app/db';

async function startApp() {
  try {
    await connectMongoClient();
    await startIndexer();
    await startRecommender();
  } catch (error) {
    console.error(error);
  }
}

startApp();
