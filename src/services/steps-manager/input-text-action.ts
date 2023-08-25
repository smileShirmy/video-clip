import type { PlayerAttribute } from '@/types'
import { Action } from './action'
import { trackList } from '../track-list/track-list'
import type { TextTrackItem } from '../track-item/text-track-item'
import { stepsManager } from './steps-manager'

type StoreAttribute = Pick<PlayerAttribute, 'topRatio' | 'leftRatio' | 'widthRatio' | 'heightRatio'>

interface StoreValue {
  text: string
  attribute: StoreAttribute
}

export class InputTextAction extends Action {
  private readonly trackItemId: string
  private startVal: StoreValue
  private endVal?: StoreValue

  constructor(trackItemId: string, startVal: StoreValue) {
    super()
    this.trackItemId = trackItemId
    this.startVal = startVal
  }

  end(endVal: StoreValue) {
    if (this.startVal.text === endVal.text) return

    this.endVal = endVal

    stepsManager.addAction(this)
  }

  setData(val: StoreValue) {
    const trackItem = trackList.getTrackItem(this.trackItemId) as TextTrackItem
    trackItem.text.value = val.text

    for (const [k, v] of Object.entries(val.attribute)) {
      trackItem.attribute[k as keyof StoreAttribute] = v
    }
  }

  undo() {
    this.setData(this.startVal)
  }

  redo() {
    if (!this.endVal) return
    this.setData(this.endVal)
  }
}
