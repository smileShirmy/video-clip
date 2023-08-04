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
    width: `${width}%`,
    left: leftHandlerStyle.value.left
  }
})

const showOverlay = computed(() => {
  return (
    props.data.component !== TrackItemName.TRACK_ITEM_VIDEO &&
    props.data.id !== trackList.selectedId
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
    if (trackList.selectedId === props.data.id) {
      trackList.setSelectedId('')
    }
  }
})
</script>

<template>
  <div
    data-track-item
    ref="trackItemRef"
    class="track-item"
    :class="{ overlay: showOverlay }"
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

  <div
    v-if="props.data.id === trackList.selectedId"
    :style="trackItemStyle"
    class="track-item-selected"
  ></div>
</template>

<lang scoped lang="scss">
.tack-item-wrapper {
  box-shadow: 0 0 0 1px var(--app-color-white) inset;
}

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
  bottom: 0;
  border-radius: 4px;
  box-sizing: border-box;
  border: 1px solid var(--app-color-white);
  pointer-events: none;
  z-index: 1;
}
</lang>
