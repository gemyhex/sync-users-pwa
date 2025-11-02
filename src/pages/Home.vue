<template>
  <div class="space-y-8">
    <SyncModal :visible="isLoading" />
    <!-- User Status Card -->
    <div class="p-6 bg-slate-800 rounded-xl shadow-xl border border-slate-700">
      <h1 class="text-3xl font-extrabold text-white mb-2">
        Welcome, {{ auth.currentUser?.username }}!
      </h1>
      <p class="text-slate-300 mb-4">
        This application is offline-ready. Data is fetched on login and syncs
        every minute.
      </p>
      <p class="text-xs text-slate-500 mt-2">
        Last Sync:
        {{
          sync.lastSync ? new Date(sync.lastSync).toLocaleTimeString() : "Never"
        }}
      </p>
      <p v-if="sync.syncError" class="mt-2 text-red-400 text-sm font-medium">
        Sync Error: {{ sync.syncError }}
      </p>
    </div>

    <!-- Cached Users Table -->
    <div class="p-6 bg-slate-800 rounded-xl shadow-xl border border-slate-700">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold text-white">Cached Users (Encrypted)</h2>
        <button
          @click="loadUsers"
          :disabled="isLoading || sync.isSyncing"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50 shadow-md"
        >
          <span v-if="isLoading">Loading...</span>
          <span v-else>Load/Refresh Cache</span>
        </button>
      </div>

      <p v-if="loadError" class="text-red-400 mb-4">{{ loadError }}</p>

      <!-- Responsive Table Container -->
      <div class="overflow-x-auto rounded-lg shadow-inner">
        <table class="min-w-full divide-y divide-slate-700">
          <thead class="bg-slate-700 sticky top-0">
            <tr>
              <th
                scope="col"
                class="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-200"
              >
                ID
              </th>
              <th
                scope="col"
                class="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-200"
              >
                Username
              </th>
              <th
                scope="col"
                class="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-200"
              >
                First Name
              </th>
              <th
                scope="col"
                class="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-200"
              >
                Last Name
              </th>
              <th
                scope="col"
                class="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-200"
              >
                Email
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700 bg-slate-800">
            <tr v-if="!isLoading && users.length === 0">
              <td colspan="4" class="p-8 text-center text-slate-400">
                No users loaded from IndexedDB cache yet.
              </td>
            </tr>
            <tr
              v-for="user in users"
              :key="user.id"
              class="hover:bg-slate-700/50 transition duration-100"
            >
              <td
                class="whitespace-nowrap py-4 px-4 text-sm font-medium text-white"
              >
                {{ user?.id }}
              </td>
              <td class="whitespace-nowrap py-4 px-4 text-sm text-slate-300">
                {{ user?.username }}
              </td>
              <td class="whitespace-nowrap py-4 px-4 text-sm text-slate-300">
                {{ user?.firstName }}
              </td>
              <td class="whitespace-nowrap py-4 px-4 text-sm text-slate-300">
                {{ user?.lastName }}
              </td>
              <td class="whitespace-nowrap py-4 px-4 text-sm text-slate-300">
                {{ user?.email }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import userSyncService from "@/services/userSync";
import { useAuthStore } from "@/modules/auth/stores/auth.store";
import SyncModal from "@/components/SyncModal.vue";

const auth = useAuthStore();
const users = ref<any[]>([]);
const isLoading = ref(false);
const loadError = ref<string | null>(null);
const sync = ref({
  lastSync: localStorage.getItem("lastUserSync"),
  isSyncing: false,
  syncError: null,
});

async function loadUsers() {
  try {
    isLoading.value = true;
    users.value = await userSyncService.getAllCachedUsers();
    sync.value.lastSync = localStorage.getItem("lastUserSync");
  } catch (e: any) {
    loadError.value = e?.message || String(e);
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  try {
    isLoading.value = true;
    await userSyncService.start();
    if (typeof userSyncService.setupAutoSync === "function") {
      userSyncService.setupAutoSync();
    }
    await loadUsers();
  } catch (err: any) {
    console.error("[Home] Initial sync failed:", err);
    sync.value.syncError = err?.message || "Failed to sync users.";
  } finally {
    isLoading.value = false;
  }

  // Listen to sync events
  userSyncService.events.addEventListener("synced", async () => {
    await loadUsers();
  });

  userSyncService.events.addEventListener("sync-error", (e: any) => {
    sync.value.syncError = e.detail?.message || "Unknown sync error";
  });
});

onUnmounted(() => {
  userSyncService.stop();
});
</script>
