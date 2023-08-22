import type { TrackData } from '@/types'
import type { TrackItem } from '../track-item'
import { trackList } from '../track-list/track-list'
import { Action } from './action'
import { toTrack } from './helper'
import { stepsManager } from './steps-manager'

interface StoreValue {
  id: string
  startFrame: number
  endFrame: number
  minFrame: number
  parentTrackData: TrackData
}

export class MoveTrackItemAction extends Action {
  private startVal?: StoreValue
  private endVal?: StoreValue
  private parentTrackIndex = 0

  constructor(trackItem: TrackItem) {
    super()
    const { id, startFrame, endFrame, minFrame, parentTrack } = trackItem
    const parentTrackId = parentTrack?.id!
    const { track, index } = trackList.findTrack(parentTrackId)
    this.parentTrackIndex = index
    if (track) {
      this.startVal = {
        id,
        startFrame,
        endFrame,
        minFrame,
        parentTrackData: track.toData()
      }
    }
  }

  end(trackItem: TrackItem) {
    const { id, startFrame, endFrame, minFrame, parentTrack } = trackItem
    const parentTrackId = parentTrack?.id!
    const { track } = trackList.findTrack(parentTrackId)
    if (track) {
      this.endVal = {
        id,
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
    const trackItem = trackList.getTrackItem(val.id)

    if (!trackItem) {
      return
    }

    const { startFrame, endFrame, minFrame, parentTrackData } = val
    trackItem.setStartFrame(startFrame)
    trackItem.setEndFrame(endFrame)
    trackItem.minFrame = minFrame

    const { track } = trackList.findTrack(parentTrackData.base.id)
    if (track) {
      track.addTrackItem(trackItem)
    } else {
      const parentTrack = toTrack(parentTrackData)
      trackList.insertTrack(parentTrack, this.parentTrackIndex)
      parentTrack.addTrackItem(trackItem)
    }
  }

  undo() {
    this.moveTo(this.startVal)
  }

  redo() {
    this.moveTo(this.endVal)
  }
}
