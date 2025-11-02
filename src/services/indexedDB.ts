export class IndexedDBService {
  private dbName: string;
  private db?: IDBDatabase;

  constructor(dbName = 'user-sync-db') {
    this.dbName = dbName;
  }

  async open() {
    if (this.db) return this.db;
    return new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(this.dbName, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('users')) {
          const store = db.createObjectStore('users', { keyPath: 'id' });
          store.createIndex('email', 'email', { unique: false });
          store.createIndex('username', 'username', { unique: false });
        }
      };
      req.onsuccess = () => {
        this.db = req.result;
        resolve(this.db);
      };
      req.onerror = () => reject(req.error);
      req.onblocked = () => console.warn('IndexedDB open blocked');
    });
  }

  async put(storeName: string, value: any) {
    const db = await this.open();
    return new Promise<void>((res, rej) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put(value);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  }

  async bulkPut(storeName: string, values: any[]) {
    const db = await this.open();
    return new Promise<void>((res, rej) => {
      const tx = db.transaction(storeName, 'readwrite');
      const st = tx.objectStore(storeName);
      for (const v of values) st.put(v);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  }

  async getAll(storeName: string) {
    const db = await this.open();
    return new Promise<any[]>((res, rej) => {
      const tx = db.transaction(storeName, 'readonly');
      const st = tx.objectStore(storeName);
      const req = st.getAll();
      req.onsuccess = () => res(req.result);
      req.onerror = () => rej(req.error);
    });
  }

  async clear(storeName: string) {
    const db = await this.open();
    return new Promise<void>((res, rej) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).clear();
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    });
  }

  async deleteDatabase() {
    return new Promise<void>((resolve, reject) => {
      const delReq = indexedDB.deleteDatabase(this.dbName);
      delReq.onsuccess = () => resolve();
      delReq.onerror = () => reject(delReq.error);
      delReq.onblocked = () => console.warn('deleteDatabase blocked');
    });
  }
}

export const db = new IndexedDBService();
export const dbService = db;
