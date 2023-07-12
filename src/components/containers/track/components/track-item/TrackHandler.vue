<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CSSProperties, ComputedRef } from 'vue'
import { useTimelineStore } from '@/stores/timeline'
import { useTrackStore } from '@/stores/track'
import { Slider } from '@/services/slider/slider'
import { type TrackItem } from '@/services/track-item/track-item'
import { trackLineList } from '@/services/track-line-list/track-line-list'
import { onClickOutside } from '@vueuse/core'
import { isString } from '@/services/helpers/general'
import { draggable } from '@/services/draggable/draggable'

const timelineStore = useTimelineStore()
const trackStore = useTrackStore()

const props = defineProps<{
  data: TrackItem
}>()

const HANDLER_WIDTH = 10

let allowMaxFrame = 0
let allowMinFrame = 0

const trackItemRef = ref<HTMLDivElement | null>(null)

const leftHandlerStyle: ComputedRef<CSSProperties> = computed(() => {
  return {
    visibility: draggable.movingId.value === props.data.id ? 'hidden' : 'unset',
    left: timelineStore.frameToPercentWithUnit(props.data.startFrame)
  }
})

const rightHandlerStyle: ComputedRef<CSSProperties> = computed(() => {
  return {
    visibility: draggable.movingId.value === props.data.id ? 'hidden' : 'unset',
    left: timelineStore.frameToPercentWithUnit(props.data.endFrame)
  }
})

const trackItemStyle: ComputedRef<CSSProperties> = computed(() => {
  const width =
    timelineStore.frameToPercent(props.data.endFrame) -
    timelineStore.frameToPercent(props.data.startFrame)
  return {
    visibility: draggable.movingId.value === props.data.id ? 'hidden' : 'unset',
    height: '60px',
    width: `${width}%`,
    left: leftHandlerStyle.value.left
  }
})

const leftSlider = new Slider({
  change(v: number) {
    if (v > allowMaxFrame) {
      props.data.setStartFrame(allowMaxFrame)
    } else {
      props.data.setStartFrame(v < allowMinFrame ? allowMinFrame : v)
    }
  },
  dragend() {
    trackStore.updateMaxFrameCount(1)
    trackLineList.setSelectedId(props.data.id)
    draggable.resizing = false
  }
})

const rightSlider = new Slider({
  change(v: number) {
    if (v < allowMinFrame) {
      props.data.setEndFrame(allowMinFrame)
    } else {
      props.data.setEndFrame(v > allowMaxFrame ? allowMaxFrame : v)
    }
  },
  dragend() {
    trackStore.updateMaxFrameCount(1)
    trackLineList.setSelectedId(props.data.id)
    draggable.resizing = false
  }
})

function getMinWidthFrame() {
  const minFrameCount = timelineStore.pixelToFrame(HANDLER_WIDTH)
  const frameCount = props.data.endFrame - props.data.startFrame
  return frameCount < minFrameCount ? frameCount : minFrameCount
}

function onLeftHandlerDown(event: MouseEvent | TouchEvent) {
  event.stopPropagation()

  allowMinFrame = props.data.getAllowMinFrame()
  allowMaxFrame = props.data.endFrame - getMinWidthFrame()
  draggable.resizing = true
  trackStore.showPreviewLine = false

  leftSlider.onDown(event, {
    min: 0,
    max: timelineStore.maxFrameCount,
    sliderSize: timelineStore.timelineWidth,
    value: props.data.startFrame
  })
}

function onRightHandlerDown(event: MouseEvent | TouchEvent) {
  event.stopPropagation()

  allowMinFrame = props.data.startFrame + getMinWidthFrame()
  allowMaxFrame = props.data.getAllowMaxFrame()
  draggable.resizing = true
  trackStore.showPreviewLine = false

  rightSlider.onDown(event, {
    min: 0,
    max: timelineStore.maxFrameCount,
    sliderSize: timelineStore.timelineWidth,
    value: props.data.endFrame
  })
}

function onDragStart(e: PointerEvent) {
  e.stopPropagation()
  e.preventDefault()

  if (!trackItemRef.value) return

  trackLineList.setSelectedId(props.data.id)

  props.data.recordBeforeDragFrame()

  draggable.onDragStart(e, trackItemRef.value, props.data, props.data.id, {
    offsetX: e.offsetX,
    offsetY: e.offsetY
  })
}

onClickOutside(trackItemRef, (e: PointerEvent) => {
  const el = e.target
  if (el instanceof HTMLElement && isString(el.dataset.clearSelected)) {
    if (trackLineList.selectedId === props.data.id) {
      trackLineList.setSelectedId('')
    }
  }
})
</script>

<template>
  <div
    data-track-item
    ref="trackItemRef"
    class="track-item"
    :class="{ selected: props.data.id === trackLineList.selectedId }"
    :style="trackItemStyle"
    @pointerdown="onDragStart"
  >
    <slot></slot>
  </div>

  <div
    class="track-handler left-handler"
    :style="leftHandlerStyle"
    @mousedown="onLeftHandlerDown"
    @touchstart="onLeftHandlerDown"
  ></div>
  <div
    class="track-handler right-handler"
    :style="rightHandlerStyle"
    @mousedown="onRightHandlerDown"
    @touchstart="onRightHandlerDown"
  ></div>
</template>

<lang scoped lang="scss">
.track-handler {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;

  &.right-handler {
    transform: translate(-100%);
  }
}

.track-item {
  position: absolute;
  overflow: hidden;
  border-radius: 4px;
  background-color: #666;
  opacity: 1 !important;

  &.selected {
    box-shadow: 0 0 0 1px var(--app-color-white) inset;
  }
}
</lang>
