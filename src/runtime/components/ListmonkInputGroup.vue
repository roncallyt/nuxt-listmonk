<script setup lang="ts">
defineProps<{
  id: string
  label: string
}>()
</script>

<template>
  <div>
    <label :for="id">{{ label }}</label>

    <slot :id="id" />
  </div>
</template>
