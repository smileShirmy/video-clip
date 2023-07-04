<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties, ComputedRef } from 'vue'
import { useTimelineStore } from '@/stores/timeline'
import { useTrackStore } from '@/stores/track'
import { Slider } from '@/services/slider/slider'
import type { TrackItem } from '@/services/track-item/track-item'
import { trackLineList } from '@/services/track-line-list/track-line-list'

const timelineStore = useTimelineStore()
const trackStore = useTrackStore()

const props = defineProps<{
  data: TrackItem
}>()

const HANDLER_WIDTH = 10

let allowMaxFrame = 0
let allowMinFrame = 0

const leftHandlerStyle: ComputedRef<CSSProperties> = computed(() => {
  return {
    left: timelineStore.frameToPercentWithUnit(props.data.startFrame)
  }
})

const rightHandlerStyle: ComputedRef<CSSProperties> = computed(() => {
  return {
    left: timelineStore.frameToPercentWithUnit(props.data.endFrame)
  }
})

const trackItemStyle: ComputedRef<CSSProperties> = computed(() => {
  return {
    height: '60px',
    width: timelineStore.frameToPixelWidthWithUnit(props.data.endFrame - props.data.startFrame),
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
  }
})

const rightSlider = new Slider({
  change(v: number) {
    if (v < allowMinFrame) {
      props.data.setEndFrame(allowMinFrame)
    } else {
      props.data.setEndFrame(v > allowMaxFrame ? allowMaxFrame : v)
    }
  }
})

function getMinWidthFrame() {
  const minFrameCount = timelineStore.pixelToFrame(HANDLER_WIDTH)
  const frameCount = props.data.endFrame - props.data.startFrame
  return frameCount < minFrameCount ? frameCount : minFrameCount
}

function onLeftHandlerDown(event: MouseEvent | TouchEvent) {
  allowMinFrame = props.data.getAllowMinFrame()
  allowMaxFrame = props.data.endFrame - getMinWidthFrame()

  leftSlider.onDown(event, {
    min: 0,
    max: timelineStore.maxFrameCount,
    sliderSize: timelineStore.timelineWidth,
    value: props.data.startFrame
  })
}

function onRightHandlerDown(event: MouseEvent | TouchEvent) {
  allowMinFrame = props.data.startFrame + getMinWidthFrame()
  allowMaxFrame = props.data.getAllowMaxFrame()

  rightSlider.onDown(event, {
    min: 0,
    max: timelineStore.maxFrameCount,
    sliderSize: timelineStore.timelineWidth,
    value: props.data.endFrame
  })
}

function onDragStart(e: DragEvent) {
  trackStore.disableScroll = true
  trackLineList.setDraggingItem(props.data)

  trackLineList.dragOffsetX = e.offsetX

  props.data.recordBeforeDragFrame()
}
</script>

<template>
  <div
    class="track-item"
    :style="trackItemStyle"
    @dragstart="onDragStart"
    @dragend="trackStore.onDragend"
    draggable="true"
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
  background-color: var(--app-color-white);
  opacity: 1 !important;
}
</lang>
