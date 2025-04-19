<script setup lang="ts">
import { ref, provide } from 'vue'

const emit = defineEmits(['subscribed'])

const email = ref('')
const name = ref('')

provide('email', email)
provide('name', name)

async function submit() {
  const subscriber = {
    email: email.value,
    name: name.value,
  }

  await useSubscribe(subscriber)

  emit('subscribed', subscriber)
}
</script>

<template>
  <form
    @submit.prevent="submit"
  >
    <slot />
  </form>
</template>
