import { DEFAULT_PLAYER, Player } from './types';

const DB_NAME = 'system-web-db';
const DB_VERSION = 1;
const STORE = 'player';
const PLAYER_KEY = 'main';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadPlayer(): Promise<Player> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readonly').objectStore(STORE).get(PLAYER_KEY);
    request.onsuccess = async () => {
      if (request.result) resolve(request.result as Player);
      else {
        await savePlayer(DEFAULT_PLAYER);
        resolve(DEFAULT_PLAYER);
      }
    };
    request.onerror = () => reject(request.error);
  });
}

export async function savePlayer(player: Player): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORE, 'readwrite').objectStore(STORE).put(player, PLAYER_KEY);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
