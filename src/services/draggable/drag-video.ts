import type { VideoTrackItem } from '../track-item/video-track-item'
import { DragItem, type DragOptions } from './drag-item'

export class DragVideo extends DragItem<VideoTrackItem> {
  constructor(options: DragOptions<VideoTrackItem>) {
    super(options)
  }

  onDragging = (e: PointerEvent) => {
    e.preventDefault()

    // 第一次拖动时初始化拖动的 DOM 元素
    if (!this.draggingTarget) {
      this.initDraggingTarget(e)
    }

    this.updateTargetPosition(e)
  }

  onDragEnd = (e: PointerEvent) => {
    this.destroy()
  }
}
