import type { TrackItem } from '../track-item'
import { trackList } from '../track-list/track-list'
import { Action } from './action'
import { stepsManager } from './steps-manager'

interface StoreValue {
  id: string
  startFrame: number
  endFrame: number
}

export class ResizeTrackItemAction extends Action {
  private startVal: StoreValue
  private endVal?: StoreValue

  constructor(trackItem: TrackItem) {
    super()
    const { id, startFrame, endFrame } = trackItem
    this.startVal = {
      id,
      startFrame,
      endFrame
    }
  }

  end(trackItem: TrackItem) {
    const { id, startFrame, endFrame } = trackItem
    if (startFrame === this.startVal.startFrame && endFrame === this.startVal.endFrame) {
      return
    }

    this.endVal = {
      id,
      startFrame,
      endFrame
    }

    stepsManager.addAction(this)
  }

  setPosition(val?: StoreValue) {
    if (!val) return

    const trackItem = trackList.getTrackItem(val.id)

    if (!trackItem) {
      return
    }

    trackItem.setStartFrame(val.startFrame)
    trackItem.setEndFrame(val.endFrame)
  }

  undo() {
    this.setPosition(this.startVal)
  }

  redo() {
    this.setPosition(this.endVal)
  }
}
