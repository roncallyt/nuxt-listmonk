<script setup lang="ts">
defineProps<{
  type?: string
  title: string
}>()
</script>

<template>
  <button
    :type="type || 'submit'"
  >
    {{ title }}
  </button>
</template>
