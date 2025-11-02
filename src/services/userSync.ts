import { openDB, DBSchema, IDBPDatabase } from "idb";
import { apiClient, ApiResponse } from "@/api/apiClient";

const DB_NAME = "user-sync-db";
const DB_VERSION = 1;
const STORE_NAME = "users";

const MAX_PAGES = 10;
const MAX_RECORDS = 1000;
const PAGE_SIZE = 100;

interface UserSyncDB extends DBSchema {
  users: {
    key: number;
    value: {
      id: number;
      username?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      [k: string]: any;
    };
  };
}

export class UserSyncService {
  private dbPromise: Promise<IDBPDatabase<UserSyncDB>>;
  private autoSyncTimer?: number;
  public isSyncing = false;
  public events = new EventTarget();
  constructor(private config = { maxPages: 10, maxRecords: 1000, pageSize: 100 }) {
    this.dbPromise = openDB<UserSyncDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      },
    });
  }

  async getAllCachedUsers() {
    const db = await this.dbPromise;
    return db.getAll(STORE_NAME);
  }

  private async saveUsers(users: any[]) {
    const db = await this.dbPromise;
    const tx = db.transaction(STORE_NAME, "readwrite");
    for (const u of users) {
      const [firstName, ...rest] = (u.name || "").split(" ");
      const adapted = {
        ...u,
        firstName: firstName || "",
        lastName: rest.join(" ") || "",
      };
      tx.store.put(adapted);
    }
    await tx.done;
  }

  async fetchAndStoreAllPages() {
    if (this.isSyncing) return;

    this.isSyncing = true;
    const allUsers: any[] = [];
    try {
      let page = 1;

      type UsersResult = any[] | ApiResponse<any[]>;
      while (page <= MAX_PAGES && allUsers.length < MAX_RECORDS) {
        const endpoint = `/users?page=${page}&size=${PAGE_SIZE}`;
        const result = await apiClient.getDecrypted<UsersResult>(endpoint);
        const usersPage = Array.isArray(result)
          ? result
          : result?.data || [];

        if (!usersPage.length) break;

        allUsers.push(...usersPage);

        if (allUsers.length >= MAX_RECORDS || usersPage.length < PAGE_SIZE) {
          break;
        }

        page++;
      }

      await this.saveUsers(allUsers);
      localStorage.setItem("lastUserSync", new Date().toISOString());
      this.events.dispatchEvent(new CustomEvent("synced", { detail: allUsers.length }));
    } catch (err) {
      this.events.dispatchEvent(new CustomEvent("sync-error", { detail: err }));
    } finally {
      this.isSyncing = false;
    }
  }

  async start() {
    await this.fetchAndStoreAllPages();
  }

  setupAutoSync() {
    this.stopAutoSync();

    this.autoSyncTimer = window.setInterval(() => {
      this.fetchAndStoreAllPages().catch(console.error);
    }, 60 * 1000);

    window.addEventListener("online", () => {
      this.fetchAndStoreAllPages().catch(console.error);
    });
  }

  stopAutoSync() {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = undefined;
    }
  }

  stop() {
    this.stopAutoSync();
  }
}

export const userSyncService = new UserSyncService();
export default userSyncService;
