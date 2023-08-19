import type { PlayerAttribute } from '@/types'
import type { PlayerTrackItem } from '../track-item'
import { ref, shallowReactive, warn, type ShallowReactive, type ComputedRef, computed } from 'vue'

abstract class Action {
  // 撤销
  abstract undo(): void

  // 重做
  abstract redo(): void
}

class StepsManager {
  readonly stackM: ShallowReactive<Action[]> = shallowReactive([])
  readonly stackN: ShallowReactive<Action[]> = shallowReactive([])
  readonly allowUndo: ComputedRef<boolean>
  readonly allowRedo: ComputedRef<boolean>

  constructor() {
    this.allowUndo = computed(() => this.stackM.length > 0)
    this.allowRedo = computed(() => this.stackN.length > 0)
  }

  addAction(step: Action) {
    this.stackN.length = 0
    this.stackM.push(step)
  }

  // 重做
  redo() {
    if (this.stackN.length) {
      const last = this.stackN.pop()!
      this.stackM.push(last)
      last.redo()
    }
  }

  // 撤销
  undo() {
    if (this.stackM.length) {
      const last = this.stackM.pop()!
      this.stackN.push(last)
      last.undo()
    }
  }
}

const stepsManager = new StepsManager()

export { stepsManager }

/**
 * 撤销/重做
 *
 * 1. 根据实际动作过程来进行记录（比如拖拽开始到结束、比如缩放开始到结束），记录时需要有值的改变
 */
export class PlayerAttributeChangeAction extends Action {
  private trackItem: PlayerTrackItem
  private startVal: number
  private endVal?: number
  private key: keyof PlayerAttribute

  constructor(trackItem: PlayerTrackItem, key: keyof PlayerAttribute, startVal: number) {
    super()
    this.trackItem = trackItem
    this.startVal = startVal
    this.key = key
  }

  static create(trackItem: PlayerTrackItem, key: keyof PlayerAttribute, startVal: number) {
    return new PlayerAttributeChangeAction(trackItem, key, startVal)
  }

  public end(value: number) {
    this.endVal = value
    stepsManager.addAction(this)
  }

  redo() {
    if (!this.endVal) {
      warn('请检查是否没有设置结束值？')
      return
    }
    this.trackItem.attribute[this.key] = this.endVal
  }

  undo() {
    this.trackItem.attribute[this.key] = this.startVal
  }
}
