import type { PlayerAttribute } from '@/types'
import { stepsManager } from './steps-manager'
import { warn } from '../helpers/warn'
import { Action } from './action'
import { trackList } from '../track-list/track-list'
import { isPlayerTrackItem } from '../track-item/helper'

export class PlayerAttributeChangeAction extends Action {
  private trackItemId: string
  private startVal: number
  private endVal?: number
  private key: keyof PlayerAttribute

  constructor(trackItemId: string, key: keyof PlayerAttribute, startVal: number) {
    super()
    this.trackItemId = trackItemId
    this.startVal = startVal
    this.key = key
  }

  static create(trackItemId: string, key: keyof PlayerAttribute, startVal: number) {
    return new PlayerAttributeChangeAction(trackItemId, key, startVal)
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
    const trackItem = trackList.getTrackItem(this.trackItemId)
    if (trackItem && isPlayerTrackItem(trackItem)) {
      trackItem.attribute[this.key] = this.endVal
    }
  }

  undo() {
    const trackItem = trackList.getTrackItem(this.trackItemId)
    if (trackItem && isPlayerTrackItem(trackItem)) {
      trackItem.attribute[this.key] = this.startVal
    }
  }
}
