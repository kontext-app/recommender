import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';

const adapter = new FileSync<{
  dids: string[];
}>('db.json');
const db = low(adapter);

db.defaults({ dids: [] }).write();

export function putDID(did: string): void {
  const dids = db.get('dids').value();
  const uniqueDIDs = Array.from(new Set([...dids, did]));
  db.set('dids', uniqueDIDs).write();
}

export function removeDID(did: string): void {
  db.get('dids').remove(did).write();
}

export function getDIDs(): string[] {
  return db.get('dids').value();
}
