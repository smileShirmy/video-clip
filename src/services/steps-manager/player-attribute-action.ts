import type { PlayerAttribute } from '@/types'
import { stepsManager } from './steps-manager'
import { Action } from './action'
import { trackList } from '../track-list/track-list'
import { isPlainObject } from '../helpers/general'
import type { PlayerTrackItem } from '../track-item'

type Key = keyof PlayerAttribute

// 确保初始值和结束值类型一致
type StoreValue<K extends Key> = { [k in K]: PlayerAttribute[k] }

export class PlayerAttributeChangeAction<K extends Key> extends Action {
  private trackItemId: string
  private startVal: StoreValue<K>
  private endVal?: StoreValue<K>

  constructor(trackItemId: string, startVal: StoreValue<K>) {
    super()
    this.trackItemId = trackItemId
    this.startVal = startVal
  }

  public end(value: StoreValue<K>) {
    if (value === this.startVal) return

    this.endVal = value
    stepsManager.addAction(this)
  }

  setData(val: StoreValue<K>) {
    const trackItem = trackList.getTrackItem(this.trackItemId) as PlayerTrackItem
    for (const [k, v] of Object.entries<number>(val)) {
      trackItem.attribute[k as keyof PlayerAttribute] = v
    }
  }

  undo() {
    this.setData(this.startVal)
  }

  redo() {
    if (isPlainObject(this.endVal)) {
      this.setData(this.endVal)
    }
  }
}
