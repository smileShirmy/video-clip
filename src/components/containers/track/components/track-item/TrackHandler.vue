<script setup lang="ts">
import { computed, toRaw } from 'vue'
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

const initStartFrame = toRaw(props.data.startFrame)

const sliderSize = computed(
  () => timelineStore.frameWidth * (props.data.endFrame - props.data.startFrame)
)

const trackItemContainerStyle: ComputedRef<CSSProperties> = computed(() => {
  return {
    left: `${((timelineStore.frameWidth * initStartFrame) / timelineStore.timelineWidth) * 100}%`
  }
})

const trackItemWrapperStyle: ComputedRef<CSSProperties> = computed(() => {
  return {
    height: '60px',
    width: `${(props.data.endFrame - props.data.startFrame) * timelineStore.frameWidth}px`
  }
})

const leftHandlerStyle: ComputedRef<CSSProperties> = computed(() => {
  return {
    left: `${
      ((timelineStore.frameWidth * (props.data.startFrame - initStartFrame)) / sliderSize.value) *
      100
    }%`
  }
})

const rightHandlerStyle: ComputedRef<CSSProperties> = computed(() => {
  return {
    left: `${
      ((timelineStore.frameWidth * (props.data.endFrame - initStartFrame)) / sliderSize.value) * 100
    }%`
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
    props.data.setStartFrame(v + initStartFrame)
  }
})

const rightSlider = new Slider({
  change(v: number) {
    props.data.setEndFrame(v + initStartFrame)
  }
})

function onLeftHandlerDown(event: MouseEvent | TouchEvent) {
  const value = props.data.startFrame - initStartFrame
  leftSlider.onDown(event, {
    min: 0,
    max: props.data.endFrame - props.data.startFrame,
    sliderSize: sliderSize.value,
    value: value > 0 ? value : 0
  })
}

function onRightHandlerDown(event: MouseEvent | TouchEvent) {
  const value = props.data.endFrame - initStartFrame
  rightSlider.onDown(event, {
    min: 0,
    max: props.data.endFrame - props.data.startFrame,
    sliderSize: sliderSize.value,
    value: value > 0 ? value : 0
  })
}

function onDragStart(e: DragEvent) {
  trackStore.disableScroll = true
  trackLineList.setDraggingItem(props.data)

  trackStore.dragstartOffsetX = e.offsetX
}
</script>

<template>
  <!-- container 用于定位相对于 trackLine 的偏移值 -->
  <div class="track-item-container" :style="trackItemContainerStyle">
    <!-- wrapper 用于提供给 trackHandler 进行定位，并且作为滑轨 -->
    <div
      class="track-item-wrapper"
      @dragstart="onDragStart"
      @dragend="trackStore.onDragend"
      draggable="true"
      :style="trackItemWrapperStyle"
    >
      <div class="track-item" :style="trackItemStyle">
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
    </div>
  </div>
</template>

<lang scoped lang="scss">
.track-item-container {
  position: absolute;

  .track-item-wrapper {
    position: relative;

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
  }
}
</lang>
