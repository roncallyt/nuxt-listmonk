<script setup lang="ts">
import { ref, provide } from 'vue'
import { useSubscribe } from '../composables/useSubscribe'

const emit = defineEmits(['subscribed', 'cleared'])

const email = ref('')
const name = ref('')

provide('email', email)
provide('name', name)

function clear() {
  email.value = ''
  name.value = ''

  emit('cleared')
}

async function submit() {
  const subscriber = {
    email: email.value,
    name: name.value,
  }

  await useSubscribe(subscriber)

  emit('subscribed', subscriber)

  clear()
}
</script>

<template>
  <form
    @submit.prevent="submit"
  >
    <slot />
  </form>
</template>
