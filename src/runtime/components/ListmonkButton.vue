<script setup lang="ts">
import { useSlots } from 'vue'

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
    <template v-if="slots?.default">
      <slot />
    </template>

    <template v-else>
      {{ title }}
    </template>
  </button>
</template>
