<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CSSProperties, ComputedRef } from 'vue'
import { useTimelineStore } from '@/stores/timeline'
import { Slider } from '@/services/slider/slider'

const timelineStore = useTimelineStore()

const props = defineProps({
  height: {
    type: Number,
    default: 60
  }
})

// TODO: 测试数据
const MOCK_DATA = {
  min: 0,
  max: 500,
  frameCount: 500
}

let leftValue = MOCK_DATA.min
let rightValue = MOCK_DATA.max

const leftPosition = ref<string>('0%')
const rightPosition = ref<string>('100%')

const leftStyle: ComputedRef<CSSProperties> = computed(() => ({
  left: leftPosition.value
}))

const rightStyle: ComputedRef<CSSProperties> = computed(() => ({
  left: rightPosition.value
}))

const trackItemStyle: ComputedRef<CSSProperties> = computed(() => ({
  height: `${props.height}px`,
  width: `${trackItemWidth.value}px`
}))

const trackItemWidth = computed(() => timelineStore.frameWidth * MOCK_DATA.frameCount)

const leftSlider = new Slider({
  change(v: number, p: string) {
    leftValue = v
    leftPosition.value = p
  }
})

const rightSlider = new Slider({
  change(v: number, p: string) {
    rightValue = v
    rightPosition.value = p
  }
})

function onLeftHandlerDown(event: MouseEvent | TouchEvent) {
  leftSlider.onDown(event, {
    min: MOCK_DATA.min,
    max: MOCK_DATA.max,
    sliderSize: trackItemWidth.value,
    value: leftValue
  })
}

function onRightHandlerDown(event: MouseEvent | TouchEvent) {
  rightSlider.onDown(event, {
    min: MOCK_DATA.min,
    max: MOCK_DATA.max,
    sliderSize: trackItemWidth.value,
    value: rightValue
  })
}
</script>

<template>
  <div class="track-item" :style="trackItemStyle">
    <div
      class="track-handler left-handler"
      :style="leftStyle"
      @mousedown="onLeftHandlerDown"
      @touchstart="onLeftHandlerDown"
    ></div>
    <div
      class="track-handler right-handler"
      :style="rightStyle"
      @mousedown="onRightHandlerDown"
      @touchstart="onRightHandlerDown"
    ></div>

    <slot></slot>
  </div>
</template>

<lang scoped lang="scss">
.track-item {
  position: relative;
  overflow: hidden;
  border-radius: 4px;

  .track-handler {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 10px;
    background-color: rgba(0, 0, 0, 0.5);

    &.right-handler {
      transform: translate(-100%);
    }
  }
}
</lang>