import type { TrackData } from '@/types'
import type { TrackItem } from '../track-item'
import { trackList } from '../track-list/track-list'
import { Action } from './action'
import { warn } from 'vue'
import { toTrack } from './helper'
import { stepsManager } from './steps-manager'

interface StoreValue {
  startFrame: number
  endFrame: number
  minFrame: number
  parentTrackData: TrackData
}

export class MoveTrackItemAction extends Action {
  private readonly trackItem: TrackItem
  private startVal?: StoreValue
  private endVal?: StoreValue
  private parentTrackIndex = 0

  constructor(trackItem: TrackItem) {
    super()
    this.trackItem = trackItem
    const { startFrame, endFrame, minFrame, parentTrack } = trackItem
    const parentTrackId = parentTrack?.id
    if (!parentTrackId) {
      warn('该行为只能作用于移动资源时')
      return
    }
    const { track, index } = trackList.findTrack(parentTrackId)
    this.parentTrackIndex = index
    if (track) {
      this.startVal = {
        startFrame,
        endFrame,
        minFrame,
        parentTrackData: track.toData()
      }
    }
  }

  end() {
    const { startFrame, endFrame, minFrame, parentTrack } = this.trackItem
    const parentTrackId = parentTrack?.id
    if (!parentTrackId) {
      warn('该行为只能作用于移动资源时')
      return
    }
    const { track } = trackList.findTrack(parentTrackId)
    if (track) {
      this.endVal = {
        startFrame,
        endFrame,
        minFrame,
        parentTrackData: track.toData()
      }
    }

    stepsManager.addAction(this)
  }

  private moveTo(val?: StoreValue) {
    if (!val) return

    const { startFrame, endFrame, minFrame, parentTrackData } = val
    this.trackItem.setStartFrame(startFrame)
    this.trackItem.setEndFrame(endFrame)
    this.trackItem.minFrame = minFrame

    const { track } = trackList.findTrack(parentTrackData.base.id)
    if (track) {
      track.addTrackItem(this.trackItem)
    } else {
      const parentTrack = toTrack(parentTrackData)
      trackList.insertTrack(parentTrack, this.parentTrackIndex)
      parentTrack.addTrackItem(this.trackItem)
    }
  }

  undo() {
    this.moveTo(this.startVal)
  }

  redo() {
    this.moveTo(this.endVal)
  }
}
