import { upsertUser } from 'app/db';

export async function subscribeToRecommender(did: string): Promise<void> {
  await upsertUser({ did, recommendationsEnabled: true });
  return;
}

export async function unsubscribeFromRecommender(did: string): Promise<void> {
  await upsertUser({ did, recommendationsEnabled: false });
  return;
}
