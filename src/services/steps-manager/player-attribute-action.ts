import type { PlayerAttribute } from '@/types'
import type { PlayerTrackItem } from '../track-item'
import { stepsManager } from './steps-manager'
import { warn } from '../helpers/warn'
import { Action } from './action'

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
