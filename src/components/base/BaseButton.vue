<template>
  <button
    :disabled="disabled"
    class="px-4 py-2 rounded-lg font-medium shadow transition bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{ disabled?: boolean }>();
</script>
