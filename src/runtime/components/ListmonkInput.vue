<script setup lang="ts">
import { inject } from 'vue'

const props = defineProps<{
  field: 'email' | 'name'
  id?: string
  required?: boolean
  type?: string
  placeholder?: string
}>()

const field = inject(props.field)
</script>

<template>
  <input
    :id="id || ''"
    v-model="field"
    :type="type || 'text'"
    :required="required || false"
    :placeholder="placeholder || ''"
  >
</template>
