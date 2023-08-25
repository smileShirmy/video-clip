import type { PlayerAttribute, TextAttribute } from '@/types'
import { Action } from './action'
import { stepsManager } from './steps-manager'
import { isNumber } from '../helpers/general'
import { trackList } from '../track-list/track-list'
import type { TextTrackItem } from '../track-item/text-track-item'

type StoreAttribute = Pick<PlayerAttribute, 'topRatio' | 'leftRatio' | 'widthRatio' | 'heightRatio'>

interface StoreValue {
  value: number
  attribute: StoreAttribute
}

export class TextAttributeAction extends Action {
  private trackItemId: string
  private startVal: StoreValue
  private endVal?: StoreValue
  private key: keyof TextAttribute

  constructor(trackItemId: string, key: keyof TextAttribute, startVal: StoreValue) {
    super()
    this.trackItemId = trackItemId
    this.startVal = startVal
    this.key = key
  }

  end(endVal: StoreValue) {
    if (endVal.value === this.startVal.value) return

    this.endVal = endVal
    stepsManager.addAction(this)
  }

  setData(val: StoreValue) {
    const trackItem = trackList.getTrackItem(this.trackItemId) as TextTrackItem
    trackItem.textAttribute[this.key] = val.value

    for (const [k, v] of Object.entries(val.attribute)) {
      trackItem.attribute[k as keyof StoreAttribute] = v
    }
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
