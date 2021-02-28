import { startRecommender } from 'app/recommender';
import { startIndexer } from 'app/indexer';

async function startApp() {
  try {
    await startIndexer();
    await startRecommender();
  } catch (error) {
    console.error(error);
  }
}

startApp();
