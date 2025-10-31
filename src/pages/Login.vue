<template>
  <div class="max-w-md mx-auto p-6 mt-24 border rounded">
    <h2 class="text-xl mb-4">Login</h2>
    <form @submit.prevent="onSubmit">
      <label class="block mb-1">Username</label>
      <input
        v-model="username"
        class="w-full mb-3 p-2 border rounded"
        autocomplete="username"
      />
      <label class="block mb-1">Password</label>
      <input
        type="password"
        v-model="password"
        class="w-full mb-3 p-2 border rounded"
        autocomplete="current-password"
      />

      <div class="flex items-center gap-2">
        <button class="px-4 py-2 bg-blue-600 text-white rounded">Login</button>
        <div v-if="loading">⏳</div>
      </div>

      <p v-if="error" class="text-red-600 mt-2">{{ error }}</p>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useAuthStore } from "@/modules/auth/stores/auth.store";
import { useRouter } from "vue-router";

export default defineComponent({
  setup() {
    const username = ref("");
    const password = ref("");
    const loading = ref(false);
    const error = ref("");
    const auth = useAuthStore();
    const router = useRouter();

    async function onSubmit() {
      error.value = "";
      loading.value = true;
      try {
        const ok = await auth.login({
          username: username.value,
          password: password.value,
        });
        if (!ok) {
          error.value = "Invalid credentials";
          return;
        }
        await router.push({ name: "home" });
      } catch (e: any) {
        error.value = e?.message || "Login error";
      } finally {
        loading.value = false;
      }
    }

    return { username, password, onSubmit, loading, error };
  },
});
</script>
