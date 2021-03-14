import { startRecommender } from 'app/recommender';
import { startIndexer, initializeIndexerIDX } from 'app/indexer';
import { initCache } from 'app/cache';

async function startApp() {
  try {
    const args = process.argv.slice(2);

    await initializeIndexerIDX();

    if (args.includes('indexer')) {
      await startIndexer();
    }

    if (args.includes('recommender')) {
      await initCache();
      await startRecommender();
    }
  } catch (error) {
    console.error(error);
  }
}

startApp();
