<script setup lang="ts">
defineProps<{
  type?: string
  title?: string
}>()

const slots = useSlots()
</script>

<template>
  <button
    :type="type || 'submit'"
  >
    <template v-if="slots.default">
      <slot />
    </template>

    <template v-else>
      {{ title }}
    </template>
  </button>
</template>
