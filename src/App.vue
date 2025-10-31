<template>
  <div class="min-h-screen">
    <!-- Sync Modal blocks all UI when active (handles global sync state) -->
    

    <!-- Main App Layout -->
    <header class="bg-slate-800 shadow-xl" v-if="auth.isAuthenticated">
      <nav
        class="container mx-auto px-4 py-3 flex justify-between items-center"
      >
        <h1 class="text-xl font-bold text-white">Sync App PWA</h1>
        <button
          @click="handleLogout"
          class="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md transition duration-200 shadow-md"
        >
          Logout
        </button>
      </nav>
    </header>

    <main class="container mx-auto px-4 py-8">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useAuthStore } from "./modules/auth/stores/auth.store";

const auth = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  auth.logout();
  router.push("/login");
};
</script>
