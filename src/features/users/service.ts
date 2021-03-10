import { putDID, removeDID } from 'app/db';

export async function subscribeToRecommender(did: string): Promise<void> {
  putDID(did);
}

export async function unsubscribeFromRecommender(did: string): Promise<void> {
  removeDID(did);
}
