import { trackList } from '../track-list/track-list'
import {
  TrackDataType,
  type DragOptions,
  type TrackDataItem,
  type BlankTopData,
  type TrackData,
  type TrackIntervalData,
  type BlankBottomData,
  DraggingState,
  type AddToCurrentTrackState,
  type AddToNewTrackState
} from './types'
import { isIntersectionOfTwoIntervals } from '../helpers/general'
import type { TrackItem } from '../track-item'
import { VideoTrack } from '../track/video-track'
import { OTHER_TRACK_HEIGHT } from '@/config'
import { DragItem } from './drag-item'
import type { TextTrackItem } from '../track-item/text-track-item'
import { warn } from '../helpers/warn'
import { AddTrackItemAction } from '../steps-manager/add-track-item-action'

export class DragText extends DragItem<TextTrackItem> {
  trackDataList: TrackDataItem[] = []
  onTrackDataList: TrackData[] = []

  constructor(options: DragOptions<TextTrackItem>) {
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
   * 在主轨道上或主轨道以下的都当作是 TrackDataType.BLANK_BOTTOM 类型，直接过滤掉
   * 因为下面是音频轨道和主轨道，TEXT 类型的资源不能放到主轨道
   */
  initTrackDataList() {
    const { baseTrackDataList, mainTrackData } = this
    this.trackDataList = baseTrackDataList.reduce((pre: TrackDataItem[], cur) => {
      if (this.isOver(cur.top, mainTrackData.top)) {
        pre.push(cur)

        if (cur.type === TrackDataType.TRACK) {
          this.onTrackDataList.push(cur)
        }
      }

      if (cur.type === TrackDataType.BLANK_BOTTOM) {
        pre.push({
          ...cur,
          top: mainTrackData.top
        })
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
      insertTrackIndex: 0,
      startFrame
    })
  }

  findAllowTrack(startIndex: number, [startFrame, endFrame]: [number, number], endIndex = 0) {
    const isIntersection = (trackItemList: TrackItem[]): boolean =>
      trackItemList.some(
        (item) =>
          item.id !== this.dragTrackItem.id &&
          isIntersectionOfTwoIntervals([startFrame, endFrame], [item.startFrame, item.endFrame])
      )

    let allowIndex = -1
    // 从下往上遍历
    for (let i = startIndex; i >= endIndex; i -= 1) {
      const trackItemList = this.onTrackDataList[i].track.trackItemList
      if (isIntersection(trackItemList) === false) {
        allowIndex = i
        break
      }
    }
    return allowIndex > -1 ? this.onTrackDataList[allowIndex] : null
  }

  /**
   * 如果当前所在轨道的位置无法容纳拖动的目标，那么则往上找到能容纳的轨道，如果找不到那么则在顶部追加一条新的轨道
   */
  [TrackDataType.TRACK](trackData: TrackData, startFrame: number) {
    const { overIntervalMiddleTop, index } = trackData
    const widthFrame = this.dragTrackItem.endFrame - this.dragTrackItem.startFrame

    const allowTrack = this.findAllowTrack(index, [startFrame, startFrame + widthFrame])

    if (allowTrack) {
      this.setAddToCurrentTrackState({
        top: allowTrack.top,
        addToTrack: allowTrack.track,
        startFrame,
        widthFrame
      })
    } else {
      this.setAddToNewTrackState({
        top: overIntervalMiddleTop,
        insertTrackIndex: index,
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
    warn('抱歉，文本暂不支持拖入主轨道哦')

    this.setAddToNewTrackState({
      top: this.mainTrackData.overIntervalMiddleTop,
      insertTrackIndex: this.mainTrackData.index,
      startFrame
    })
  }

  draggingHandler = (e: PointerEvent) => {
    e.preventDefault()

    if (this.isFirstDrag) {
      this.isFirstDrag = false
    }

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

    const track = VideoTrack.create({
      height: OTHER_TRACK_HEIGHT
    })
    trackList.insert(track, insertTrackIndex)
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

    if (this.movingId === null) {
      new AddTrackItemAction(this.dragTrackItem.toData())
    }

    this.onDragEnd(this.movingId)
    this.destroy()
  }
}
