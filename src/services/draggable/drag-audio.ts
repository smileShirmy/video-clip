import type { AudioTrackItem } from '../track-item/audio-track-item'
import { DragItem, INTERVAL_MIDDLE_OFFSET } from './drag-item'
import {
  TrackDataType,
  type DragOptions,
  type TrackData,
  type TrackDataItem,
  type BlankTopData,
  type TrackIntervalData,
  type BlankBottomData,
  type AddToCurrentTrackState,
  type AddToNewTrackState,
  DraggingState
} from './types'
import { AudioTrack } from '../track/audio-track'
import { trackList } from '../track-list/track-list'
import { isIntersectionOfTwoIntervals } from '../helpers/general'
import type { TrackItem } from '../track-item'

export class DragAudio extends DragItem<AudioTrackItem> {
  trackDataList: TrackDataItem[] = []
  onTrackDataList: TrackData[] = []

  constructor(options: DragOptions<AudioTrackItem>) {
    super(options)

    this.initTrackDataList()
    this.addListener()
  }

  addListener() {
    window.addEventListener('pointermove', this.draggingHandler)
    window.addEventListener('pointerup', this.dragEndHandler)
  }

  removeListener() {
    window.removeEventListener('pointermove', this.draggingHandler)
    window.removeEventListener('pointerup', this.dragEndHandler)
  }

  destroy() {
    this.removeListener()

    this.stateData = null
    this.trackDataList = []
    this.baseTrackDataList = []
    this.onTrackDataList = []
    this.onStateChange(null)

    if (this.draggingTarget) {
      this.draggingTarget.remove()
      this.draggingTarget = null
    }

    this.resetMoveTargetAttribute()
  }

  /**
   * 在主轨道上方(包括主轨道)的都当作是 TrackDataType.BLANK_TOP 类型，直接过滤掉
   * 只保留下面音频轨道的部分
   */
  initTrackDataList() {
    const { baseTrackDataList, mainTrackIntervalData } = this
    this.trackDataList = baseTrackDataList.reduce((pre: TrackDataItem[], cur) => {
      if (cur.type == TrackDataType.BLANK_TOP) {
        pre.push({
          ...cur,
          bottomTop: mainTrackIntervalData.bottomTop,
          overBottomIntervalTop: mainTrackIntervalData.bottomTop - INTERVAL_MIDDLE_OFFSET
        })
      }

      if (this.isUnder(cur.top, mainTrackIntervalData.bottomTop)) {
        pre.push(cur)

        if (cur.type === TrackDataType.TRACK) {
          this.onTrackDataList.push(cur)
        }
      }
      return pre
    }, [])
  }

  positionHandler(e: PointerEvent) {
    const position = this.getDragPosition(e)
    if (!position) return

    const { x, y } = position
    this.updateMoveTargetPosition(x, y)
    const startFrame = this.xToFrame(x)

    for (const trackDataItem of this.trackDataList) {
      if (
        this.isUnderOrEqual(y, trackDataItem.top) &&
        this.isOverOrEqual(y, trackDataItem.bottomTop)
      ) {
        switch (trackDataItem.type) {
          case TrackDataType.BLANK_TOP:
            this[TrackDataType.BLANK_TOP](trackDataItem, startFrame)
            break
          case TrackDataType.TRACK:
            this[TrackDataType.TRACK](trackDataItem, startFrame)
            break
          case TrackDataType.TRACK_INTERVAL:
            this[TrackDataType.TRACK_INTERVAL](trackDataItem, startFrame)
            break
          case TrackDataType.BLANK_BOTTOM:
            this[TrackDataType.BLANK_BOTTOM](trackDataItem, startFrame)
            break
        }
      }
    }
  }

  [TrackDataType.BLANK_TOP](trackData: BlankTopData, startFrame: number) {
    this.setAddToNewTrackState({
      top: trackData.overBottomIntervalTop,
      insertTrackIndex: this.mainTrackData.index + 1,
      startFrame
    })
  }

  findAllowTrack(startIndex: number, [startFrame, endFrame]: [number, number]) {
    const isIntersection = (trackItemList: TrackItem[]): boolean =>
      trackItemList.some(
        (item) =>
          item.id !== this.dragTrackItem.id &&
          isIntersectionOfTwoIntervals([startFrame, endFrame], [item.startFrame, item.endFrame])
      )

    let allowIndex = -1
    // 从上往下
    for (let i = startIndex; i < this.onTrackDataList.length; i += 1) {
      const trackItemList = this.onTrackDataList[i].track.trackItemList
      if (isIntersection(trackItemList) === false) {
        allowIndex = i
        break
      }
    }
    return allowIndex > -1 ? this.onTrackDataList[allowIndex] : null
  }

  [TrackDataType.TRACK](trackData: TrackData, startFrame: number) {
    const { index, underIntervalMiddleTop } = trackData
    const widthFrame = this.dragTrackItem.endFrame - this.dragTrackItem.startFrame

    const allowTrack = this.findAllowTrack(index - 1, [startFrame, startFrame + widthFrame])

    if (allowTrack) {
      this.setAddToCurrentTrackState({
        top: allowTrack.top,
        addToTrack: allowTrack.track,
        startFrame,
        widthFrame
      })
    } else {
      this.setAddToNewTrackState({
        top: underIntervalMiddleTop,
        insertTrackIndex: index + 1,
        startFrame
      })
    }
  }

  [TrackDataType.TRACK_INTERVAL](trackData: TrackIntervalData, startFrame: number) {
    const { middleTop, overTrackIndex } = trackData
    this.setAddToNewTrackState({
      top: middleTop,
      insertTrackIndex: overTrackIndex + 1,
      startFrame
    })
  }

  [TrackDataType.BLANK_BOTTOM](trackData: BlankBottomData, startFrame: number) {
    const lastTrackData = this.onTrackDataList[this.onTrackDataList.length - 1]
    this.setAddToNewTrackState({
      top: lastTrackData
        ? lastTrackData.underIntervalMiddleTop
        : trackData.top - INTERVAL_MIDDLE_OFFSET - 1,
      insertTrackIndex: lastTrackData ? lastTrackData.index + 1 : this.mainTrackData.index + 1,
      startFrame
    })
  }

  draggingHandler = (e: PointerEvent) => {
    e.preventDefault()

    this.initFirstDrag(e)

    this.updateDraggingTargetPosition(e)

    if (!this.isInTrackContent(e)) return

    this.positionHandler(e)
  }

  addToCurrentTrack(stateData: AddToCurrentTrackState) {
    this.dragTrackItem.setStartFrame(stateData.startFrame)
    this.dragTrackItem.setEndFrame(stateData.startFrame + stateData.widthFrame)

    stateData.addToTrack.addTrackItem(this.dragTrackItem)
  }

  addToNewTrack(stateData: AddToNewTrackState) {
    const frameCount = this.dragTrackItem.endFrame - this.dragTrackItem.startFrame
    this.dragTrackItem.setStartFrame(stateData.startFrame)
    this.dragTrackItem.setEndFrame(stateData.startFrame + frameCount)

    const { insertTrackIndex } = stateData

    const track = AudioTrack.create()
    trackList.insertTrack(track, insertTrackIndex)
    track.addTrackItem(this.dragTrackItem)
  }

  dragEndHandler = (e: PointerEvent) => {
    const { stateData } = this
    if (stateData) {
      this.positionHandler(e)
      this.resetMoveTargetAttribute()

      switch (stateData.state) {
        case DraggingState.ADD_TO_CURRENT_TRACK_STATE:
          this.addToCurrentTrack(stateData)
          break
        case DraggingState.ADD_TO_NEW_TRACK_STATE:
          this.addToNewTrack(stateData)
          break
        default:
          break
      }
    }

    this.onDragEnd(this.movingId)
    this.destroy()

    this.addDragEndAction()
  }
}
