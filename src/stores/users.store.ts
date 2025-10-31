import { defineStore } from 'pinia';
import { db } from '@/services/indexedDB';

export const useUsersStore = defineStore('users', {
  state: () => ({
    items: [] as any[],
    loading: false,
    lastSyncedAt: null as string | null
  }),
  actions: {
    async loadFromCache() {
      this.loading = true;
      try {
        this.items = (await db.getAll('users')) || [];
      } finally {
        this.loading = false;
      }
    },
    setItems(items: any[]) {
      this.items = items;
    },
    markSynced() {
      this.lastSyncedAt = new Date().toISOString();
    }
  }
});

// Optional: if some components import useSyncStore, provide alias
export const useSyncStore = useUsersStore;
