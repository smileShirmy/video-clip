<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CSSProperties, ComputedRef } from 'vue'
import { useTimelineStore } from '@/stores/timeline'
import { useTrackStore } from '@/stores/track'
import { Slider } from '@/services/slider/slider'
import { trackList } from '@/services/track-list/track-list'
import { onClickOutside } from '@vueuse/core'
import { isString } from '@/services/helpers/general'
import { draggable } from '@/services/draggable/draggable'
import type { TrackItem } from '@/services/track-item'
import { TrackItemName } from '@/types'

const timelineStore = useTimelineStore()
const trackStore = useTrackStore()

const props = defineProps<{
  data: TrackItem
}>()

const HANDLER_WIDTH = 10

let allowMaxFrame = 0
let allowMinFrame = 0

const showHandler = ref(false)

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
    width: `${width}%`,
    left: leftHandlerStyle.value.left
  }
})

const showOverlay = computed(() => {
  return (
    props.data.component !== TrackItemName.TRACK_ITEM_VIDEO &&
    props.data.id !== trackList.selectedId.value
  )
})

const dragSliderEnd = () => {
  trackStore.updateMaxFrameCount(1)
  trackList.setSelectedId(props.data.id)
  trackList.updatePlayerMaxFrame()

  draggable.resizing = false
  if (trackStore.enablePreviewLine) {
    trackStore.showPreviewLine = true
  }
}

const leftSlider = new Slider({
  change(v: number) {
    if (v > allowMaxFrame) {
      props.data.setStartFrame(allowMaxFrame)
    } else {
      props.data.setStartFrame(v < allowMinFrame ? allowMinFrame : v)
    }
  },
  dragend: dragSliderEnd
})

const rightSlider = new Slider({
  change(v: number) {
    if (v < allowMinFrame) {
      props.data.setEndFrame(allowMinFrame)
    } else {
      props.data.setEndFrame(v > allowMaxFrame ? allowMaxFrame : v)
    }
  },
  dragend: dragSliderEnd
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

  trackList.setSelectedId(props.data.id)

  props.data.recordBeforeDragFrame()

  draggable.onDragStart(e, trackItemRef.value, props.data, props.data.id, {
    offsetX: e.offsetX,
    offsetY: e.offsetY
  })
}

onClickOutside(trackItemRef, (e: PointerEvent) => {
  const el = e.target
  if (el instanceof HTMLElement && isString(el.dataset.clearSelected)) {
    if (trackList.selectedId.value === props.data.id) {
      trackList.setSelectedId('')
    }
  }
})

function onmouseenter() {
  showHandler.value = true
}

function onmouseleave() {
  showHandler.value = false
}
</script>

<template>
  <div
    data-track-item
    ref="trackItemRef"
    class="track-item"
    :class="{ overlay: showOverlay }"
    :style="trackItemStyle"
    @pointerdown="onDragStart"
    @mouseenter="onmouseenter"
    @mouseleave="onmouseleave"
  >
    <div
      class="track-item-selected"
      :class="{ 'is-selected': props.data.id === trackList.selectedId.value }"
    ></div>
    <slot :showHandler="showHandler"></slot>
  </div>

  <div
    v-show="showHandler"
    class="track-handler left-handler"
    :class="{ 'handler-selected': props.data.id === trackList.selectedId.value }"
    :style="leftHandlerStyle"
    @mousedown="onLeftHandlerDown"
    @touchstart="onLeftHandlerDown"
    @mouseenter="onmouseenter"
    @mouseleave="onmouseleave"
  ></div>
  <div
    v-show="showHandler"
    class="track-handler right-handler"
    :class="{ 'handler-selected': props.data.id === trackList.selectedId.value }"
    :style="rightHandlerStyle"
    @mousedown="onRightHandlerDown"
    @touchstart="onRightHandlerDown"
    @mouseenter="onmouseenter"
    @mouseleave="onmouseleave"
  ></div>
</template>

<lang scoped lang="scss">
.tack-item-wrapper {
  box-shadow: 0 0 0 1px var(--app-color-white) inset;
}

.track-handler {
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  bottom: 0;
  width: 10px;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1;
  border-color: transparent;
  cursor: col-resize;

  &::before {
    display: block;
    content: '';
    width: 1px;
    height: 8px;
    background-color: var(--app-color-white);
    margin-right: 2px;
  }

  &::after {
    display: block;
    content: '';
    width: 1px;
    height: 8px;
    background-color: var(--app-color-white);
  }

  &.handler-selected {
    border-color: var(--app-color-white);
  }

  &.left-handler {
    border-radius: 4px 0 0 4px;
    border-width: 1px 0 1px 1px;
    border-style: solid;
  }

  &.right-handler {
    border-radius: 0 4px 4px 0;
    transform: translate(-100%);
    border-width: 1px 1px 1px 0;
    border-style: solid;
  }
}

.track-item {
  position: absolute;
  top: 0;
  bottom: 0;
  overflow: hidden;
  border-radius: 4px;
  opacity: 1 !important;

  &.overlay {
    filter: brightness(0.8);
  }
}

.track-item-selected {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  border-radius: 4px;
  box-sizing: border-box;
  z-index: 1;
  border: 1px solid transparent;

  &.is-selected {
    border-color: var(--app-color-white);
  }
}
</lang>
