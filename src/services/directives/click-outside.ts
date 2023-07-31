import { onClickOutside, type MaybeElement } from '@vueuse/core'
import type { DirectiveBinding, FunctionDirective } from 'vue'

const handler = (): FunctionDirective<any, (evt: PointerEvent) => void> => {
  let stop = null as unknown as ReturnType<typeof onClickOutside>
  return (el: MaybeElement, binding: DirectiveBinding) => {
    if (stop) {
      stop()
      stop = onClickOutside(el, binding.value)
      return
    }
    stop = onClickOutside(el, binding.value)
  }
}

export const vOnClickOutside = handler()
