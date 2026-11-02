const DB_NAME = "tou";
const DB_VERSION = 1;

let dbPromise;

export function openDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;

        if (!db.objectStoreNames.contains("friends")) {
          db.createObjectStore("friends", { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains("wishes")) {
          const wishes = db.createObjectStore("wishes", { keyPath: "id" });
          wishes.createIndex("friendId", "friendId");
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  return dbPromise;
}

async function run(storeName, mode, action) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const request = action(tx.objectStore(storeName));

    tx.oncomplete = () => resolve(request?.result);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export const getAll = store => run(store, "readonly", s => s.getAll());
export const getOne = (store, id) => run(store, "readonly", s => s.get(id));
export const putOne = (store, value) => run(store, "readwrite", s => s.put(value));
export const removeOne = (store, id) => run(store, "readwrite", s => s.delete(id));