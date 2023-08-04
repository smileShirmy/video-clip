/**
 * 获取某个元素相对于 track-content 元素的位置
 *
 * @param {HTMLElement} el 某个元素
 * @param {HTMLElement} reference
 * @returns
 */
export function getElementPosition(
  el: HTMLElement,
  reference: HTMLElement
): { top: number; left: number } {
  if (el === reference) return { top: 0, left: 0 }

  let top = el.offsetTop
  let left = el.offsetLeft
  if (el.offsetParent instanceof HTMLElement) {
    const p = getElementPosition(el.offsetParent, reference)
    top += p.top
    left += p.left
  }
  return {
    top,
    left
  }
}

export function findParent(el: HTMLElement, condition: (el: HTMLElement) => boolean) {
  let cur: HTMLElement | null = el
  do {
    if (cur && condition(cur)) return true

    cur = cur.parentElement
  } while (cur !== null)

  return false
}

export function findParentElement(
  el: HTMLElement,
  condition: (el: HTMLElement) => boolean
): HTMLElement | null {
  let cur: HTMLElement | null = el
  do {
    if (cur && condition(cur)) return cur

    cur = cur.parentElement
  } while (cur !== null)

  return null
}
