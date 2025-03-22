export async function useSubscribe(body: { email: string, name?: string }) {
  return await $fetch(`/api/subscribe`, {
    method: 'POST',
    body,
  }).catch(console.error)
}
