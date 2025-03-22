<script setup lang="ts">
const emit = defineEmits(['subscribed'])

const email = ref('')
const name = ref('')

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
  <form @submit.prevent="submit">
    <div>
      <input
        v-model="email"
        type="email"
        name="email"
        placeholder="E-mail"
      >
    </div>

    <div>
      <input
        v-model="name"
        type="text"
        name="name"
        placeholder="Nome"
      >
    </div>

    <button type="submit">
      Enviar
    </button>
  </form>
</template>
