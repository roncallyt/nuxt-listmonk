import type { ListmonkSubscriber } from '../../module'

export async function useSubscribe<TBody extends ListmonkSubscriber>(body: TBody) {
  return await $fetch(`/api/subscribe`, {
    method: 'POST',
    body,
  })
}
