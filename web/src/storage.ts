import { Activity, DEFAULT_PLAYER, Player, Quest } from './types';

const DB_NAME = 'system-web-db';
const DB_VERSION = 2;
const STORES = { player: 'player', quests: 'quests', activity: 'activity' } as const;
const PLAYER_KEY = 'main';

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.player)) db.createObjectStore(STORES.player);
      if (!db.objectStoreNames.contains(STORES.quests)) {
        const store = db.createObjectStore(STORES.quests, { keyPath: 'id' });
        store.createIndex('dateKey', 'dateKey', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.activity)) {
        const store = db.createObjectStore(STORES.activity, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadPlayer(): Promise<Player> {
  const db = await openDb();
  const result = await requestToPromise(db.transaction(STORES.player, 'readonly').objectStore(STORES.player).get(PLAYER_KEY));
  if (!result) {
    await savePlayer(DEFAULT_PLAYER);
    return DEFAULT_PLAYER;
  }
  const saved = result as Partial<Player>;
  return {
    ...DEFAULT_PLAYER,
    ...saved,
    stats: { ...DEFAULT_PLAYER.stats, ...(saved.stats ?? {}) },
    hp: typeof saved.hp === 'number' ? saved.hp : DEFAULT_PLAYER.hp,
    maxHp: typeof saved.maxHp === 'number' ? saved.maxHp : DEFAULT_PLAYER.maxHp,
    dailyXpDate: saved.dailyXpDate ?? null,
    dailyXpEarned: typeof saved.dailyXpEarned === 'number' ? saved.dailyXpEarned : 0,
  };
}

export async function savePlayer(player: Player): Promise<void> {
  const db = await openDb();
  await requestToPromise(db.transaction(STORES.player, 'readwrite').objectStore(STORES.player).put(player, PLAYER_KEY));
}

export async function loadQuests(dateKey: string): Promise<Quest[]> {
  const db = await openDb();
  const store = db.transaction(STORES.quests, 'readonly').objectStore(STORES.quests);
  const result = await requestToPromise(store.index('dateKey').getAll(dateKey));
  return result as Quest[];
}

export async function saveQuests(quests: Quest[]): Promise<void> {
  const db = await openDb();
  const transaction = db.transaction(STORES.quests, 'readwrite');
  const store = transaction.objectStore(STORES.quests);
  quests.forEach((quest) => store.put(quest));
  await new Promise<void>((resolve, reject) => { transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error); });
}

export async function addActivity(activity: Activity): Promise<void> {
  const db = await openDb();
  await requestToPromise(db.transaction(STORES.activity, 'readwrite').objectStore(STORES.activity).put(activity));
}

export async function loadRecentActivity(limit = 8): Promise<Activity[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const request = db.transaction(STORES.activity, 'readonly').objectStore(STORES.activity).index('timestamp').openCursor(null, 'prev');
    const rows: Activity[] = [];
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor || rows.length >= limit) return resolve(rows);
      rows.push(cursor.value as Activity);
      cursor.continue();
    };
    request.onerror = () => reject(request.error);
  });
}
