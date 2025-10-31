<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center"
  >
    <div class="bg-slate-900 p-6 rounded-xl shadow-lg text-center">
      <h2 class="text-lg font-bold text-white mb-2">Syncing Data...</h2>
      <p class="text-slate-400 text-sm">Please wait while we refresh users.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean }>();
</script>
