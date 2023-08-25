import type { PlayerAttribute } from '@/types'
import { stepsManager } from './steps-manager'
import { Action } from './action'
import { trackList } from '../track-list/track-list'
import { isNumber } from '../helpers/general'
import type { PlayerTrackItem } from '../track-item'

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

  public end(value: number) {
    if (value === this.startVal) return

    this.endVal = value
    stepsManager.addAction(this)
  }

  setData(val: number) {
    const trackItem = trackList.getTrackItem(this.trackItemId) as PlayerTrackItem
    trackItem.attribute[this.key] = val
  }

  undo() {
    this.setData(this.startVal)
  }

  redo() {
    if (isNumber(this.endVal)) {
      this.setData(this.endVal)
    }
  }
}
