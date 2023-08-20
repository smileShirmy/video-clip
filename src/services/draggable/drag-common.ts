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
import { TrackType } from '../track/base-track'
import { isIntersectionOfTwoIntervals } from '../helpers/general'
import type { TrackItem } from '../track-item'
import { VideoTrack } from '../track/video-track'
import { OTHER_TRACK_HEIGHT, VIDEO_TRACK_HEIGHT } from '@/config'
import { DragItem } from './drag-item'
import type { AudioTrackItem } from '../track-item/audio-track-item'
import { TrackItemName } from '@/types'
import type { TextTrackItem } from '../track-item/text-track-item'

type DragTrackItem = Exclude<TrackItem, AudioTrackItem | TextTrackItem>

export class DragCommon extends DragItem<DragTrackItem> {
  trackDataList: TrackDataItem[] = []
  onTrackDataList: TrackData[] = []

  constructor(options: DragOptions<DragTrackItem>) {
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
   * 在主轨道下方的都当作是 TrackDataType.BLANK_BOTTOM 类型，直接过滤掉
   * 因为下面是属于音频轨道的，因此不纳入计算范围
   */
  initTrackDataList() {
    const { baseTrackDataList, mainTrackData } = this
    this.trackDataList = baseTrackDataList.reduce((pre: TrackDataItem[], cur) => {
      if (this.isOver(cur.top, mainTrackData.bottomTop)) {
        pre.push(cur)

        if (cur.type === TrackDataType.TRACK) {
          this.onTrackDataList.push(cur)
        }
      }

      if (cur.type === TrackDataType.BLANK_BOTTOM) {
        pre.push({
          ...cur,
          top: mainTrackData.bottomTop + 1
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

    // 当前不存在任何资源时
    if (trackList.isEmpty.value) {
      // 如果在主轨道上方
      if (this.isOver(y, this.mainTrackData.top)) {
        this.setAddToNewTrackState({
          top: this.mainTrackData.overIntervalMiddleTop,
          insertTrackIndex: 0,
          startFrame
        })
      } else {
        this.setAddToCurrentTrackState({
          top: this.mainTrackData.top,
          addToTrack: this.mainTrackData.track,
          startFrame: 0,
          widthFrame: this.dragTrackItem.endFrame - this.dragTrackItem.startFrame
        })
      }
      return
    }

    for (const trackDataItem of this.trackDataList) {
      if (
        this.isUnderOrEqual(y, trackDataItem.top) &&
        this.isOverOrEqual(y, trackDataItem.bottomTop)
      ) {
        /**
         * this[trackDataItem.type](trackDataItem)
         *
         * 理论上直接使用上面的语句就可以，要如何优化呢？
         */
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
    const { track, trackType, overIntervalMiddleTop, index } = trackData
    const widthFrame = this.dragTrackItem.endFrame - this.dragTrackItem.startFrame
    const stateStartFrame =
      trackType === TrackType.MAIN && this.trackStore.enableMagnetic
        ? track.getLastFrame(this.dragTrackItem)
        : startFrame

    const allowTrack = this.findAllowTrack(index, [stateStartFrame, stateStartFrame + widthFrame])

    if (allowTrack) {
      this.setAddToCurrentTrackState({
        top: allowTrack.top,
        addToTrack: allowTrack.track,
        startFrame: stateStartFrame,
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
    const { track, trackType, underIntervalMiddleTop, index } = this.mainTrackData
    const widthFrame = this.dragTrackItem.endFrame - this.dragTrackItem.startFrame

    const allowTrack = this.findAllowTrack(index, [startFrame, startFrame + widthFrame], index)

    if (allowTrack) {
      this.setAddToCurrentTrackState({
        top: allowTrack.top,
        addToTrack: allowTrack.track,
        startFrame:
          trackType === TrackType.MAIN && this.trackStore.enableMagnetic
            ? track.getLastFrame(this.dragTrackItem)
            : startFrame,
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

    // 如果插入到底部
    if (insertTrackIndex === this.mainTrackData.index + 1) {
      // 在主轨道上面创建一条轨道，并且把主轨道的资源都放进去
      const track = VideoTrack.create({
        height: this.mainTrackData.track.hasVideo ? VIDEO_TRACK_HEIGHT : OTHER_TRACK_HEIGHT
      })
      trackList.insert(track, insertTrackIndex - 1)
      track.addTrackItem(this.mainTrackData.track.trackItemList)

      // 清空主轨道并且把当前拖拽的资源放入主轨道
      this.mainTrackData.track.clearTrackList()
      this.mainTrackData.track.addTrackItem(this.dragTrackItem)
    } else {
      const track = VideoTrack.create({
        height:
          this.dragTrackItem.component === TrackItemName.TRACK_ITEM_VIDEO
            ? VIDEO_TRACK_HEIGHT
            : OTHER_TRACK_HEIGHT
      })
      trackList.insert(track, insertTrackIndex)
      track.addTrackItem(this.dragTrackItem)
    }
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
  }
}
