import { shallowReactive, type ShallowReactive, type ComputedRef, computed, ref } from 'vue'
import type { Action } from './action'
import { MAX_STEP } from '@/config'

/**
 * 撤销/重做
 * 在这里采用命令模式来实现（备忘录模式实现简单，但保存的数据量大）
 *
 * 根据实际动作过程来进行记录（比如拖拽开始到结束、比如缩放开始到结束），记录开始和结束得值，然后还原
 */
class StepsManager {
  readonly stackM: ShallowReactive<Action[]> = shallowReactive([])
  readonly stackN: ShallowReactive<Action[]> = shallowReactive([])
  readonly allowUndo: ComputedRef<boolean>
  readonly allowRedo: ComputedRef<boolean>
  loading = ref(false)

  constructor() {
    this.allowUndo = computed(() => this.loading.value === false && this.stackM.length > 0)
    this.allowRedo = computed(() => this.loading.value === false && this.stackN.length > 0)
  }

  addAction(step: Action) {
    this.stackN.length = 0
    if (this.stackM.length >= MAX_STEP) {
      this.stackM.shift()
    }
    this.stackM.push(step)
  }

  // 重做
  redo() {
    this.loading.value = true
    if (this.stackN.length) {
      const last = this.stackN.pop()!
      this.stackM.push(last)
      last.redo()
    }
    this.loading.value = false
  }

  // 撤销
  undo() {
    this.loading.value = true
    if (this.stackM.length) {
      const last = this.stackM.pop()!
      this.stackN.push(last)
      last.undo()
    }
    this.loading.value = false
  }
}

const stepsManager = new StepsManager()

export { stepsManager }
