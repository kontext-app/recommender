import { startRecommender } from 'app/recommender';
import { startIndexer } from 'app/indexer';
import { initCache } from 'app/cache';

async function startApp() {
  try {
    await initCache();
    await startIndexer();
    await startRecommender();
  } catch (error) {
    console.error(error);
  }
}

startApp();
