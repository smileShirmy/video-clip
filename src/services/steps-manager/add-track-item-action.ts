import type { TextTrackItemData } from '@/types'
import { Action } from './action'

export class AddTrackItemAction extends Action {
  trackItemData: TextTrackItemData

  constructor(trackItemData: TextTrackItemData) {
    super()
    this.trackItemData = trackItemData
  }

  undo() {
    //
  }

  redo() {
    //
  }
}
