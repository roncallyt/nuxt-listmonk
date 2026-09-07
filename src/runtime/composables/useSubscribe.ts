import type { ListmonkSubscriber } from '../types'

export async function useSubscribe<TBody extends ListmonkSubscriber>(body: TBody) {
  return await $fetch(`/api/subscribe`, {
    method: 'POST',
    body,
  })
}
