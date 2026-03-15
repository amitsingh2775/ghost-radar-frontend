// lib/db.ts

const DB_NAME = "GhostPulseDB";
const STORE_NAME = "neural_audio";

// Database initialize karne ka function
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Audio save karne ke liye
export const saveAudio = async (id: string, blob: Blob): Promise<void> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(blob, id);
  } catch (err) {
    console.error("IndexedDB Save Error:", err);
  }
};

// Audio load karne ke liye
export const getAudio = async (id: string): Promise<Blob | null> => {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
};

// Audio delete karne ke liye
export const deleteAudio = async (id: string): Promise<void> => {
  try {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
  } catch (err) {
    console.error("IndexedDB Delete Error:", err);
  }
};