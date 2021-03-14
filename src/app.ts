import { startRecommender } from 'app/recommender';
import { startIndexer } from 'app/indexer';
import { initCache } from 'app/cache';

async function startApp() {
  try {
    const args = process.argv.slice(2);

    if (args.includes('indexer')) {
      await startIndexer();
    }

    if (args.includes('recommender')) {
      initCache();
      startRecommender();
    }
  } catch (error) {
    console.error(error);
  }
}

startApp();
