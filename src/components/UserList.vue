<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl">Cached Users</h2>
      <div>
        <button @click="refresh" class="px-3 py-1 border rounded">
          Refresh
        </button>
        <button
          @click="triggerSync"
          class="ml-2 px-3 py-1 bg-blue-600 text-white rounded"
        >
          Sync Now
        </button>
      </div>
    </div>

    <div v-if="loading">Loading cached users...</div>
    <ul>
      <li v-for="u in users" :key="u.id" class="py-2 border-b">
        {{ u.firstName }} {{ masked(u.lastName) }} —
        <span class="text-sm text-gray-500">ID: {{ u.id }}</span>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { useUsersStore } from "@/stores/users.store";
import userSyncService from "../services/userSync";

export default defineComponent({
  setup() {
    const store = useUsersStore();
    const loading = ref(false);

    async function refresh() {
      loading.value = true;
      await store.loadFromCache();
      loading.value = false;
    }

    function masked(s: string) {
      if (!s) return "";
      return s[0] + "*".repeat(Math.max(0, s.length - 1));
    }

    function triggerSync() {
      userSyncService.fetchAndStoreAllPages().then(() => refresh());
    }

    onMounted(async () => {
      await refresh();
    });

    return { users: store.items, refresh, masked, loading, triggerSync };
  },
});
</script>
