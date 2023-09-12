<script setup lang="ts">
/**
 * TODO: 改成使用 slider.ts
 */
import { isNumber } from '@/services/helpers/general'
import { nextTick } from 'vue'
import { computed, ref } from 'vue'
import type { CSSProperties, ComputedRef } from 'vue'
import IconZoomIn from '@/components/icons/IconZoomIn.vue'
import IconZoomOut from '@/components/icons/IconZoomOut.vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  step: {
    type: Number,
    default: 1
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits({
  ['update:modelValue']: (val) => isNumber(val),
  change: (val) => isNumber(val)
})

const slider = ref<HTMLDivElement>()
let startPosition = 0
let newPosition = 0
let startX = 0
let currentX = 0
let sliderSize = 1
let dragging = false
let isClick = false

const currentPosition = computed(() => {
  return `${((props.modelValue - props.min) / (props.max - props.min)) * 100}%`
})

const buttonStyle: ComputedRef<CSSProperties> = computed(() => ({
  left: currentPosition.value
}))

const barStyle: ComputedRef<CSSProperties> = computed(() => ({
  width: currentPosition.value
}))

const emitChange = async () => {
  await nextTick()
  emit('change', props.modelValue)
}

function resetSize() {
  if (slider.value) {
    sliderSize = slider.value.clientWidth
  }
}

function getClientX(event: MouseEvent | TouchEvent) {
  if (event instanceof TouchEvent) {
    return event.touches[0].clientX
  }
  return event.clientX
}

function onDragStart(event: MouseEvent | TouchEvent) {
  dragging = true
  isClick = true
  const clientX = getClientX(event)
  startX = clientX
  startPosition = parseFloat(currentPosition.value)
  newPosition = startPosition
}

// 缩小
function zoomOut() {
  if (props.disabled) return

  if (props.modelValue > props.min) {
    emit('update:modelValue', props.modelValue - 1)
  }
}

// 放大
function zoomIn() {
  if (props.disabled) return

  if (props.modelValue < props.max) {
    emit('update:modelValue', props.modelValue + 1)
  }
}

function onDragging(event: MouseEvent | TouchEvent) {
  if (dragging) {
    isClick = false
    resetSize()
    let diff = 0
    const clientX = getClientX(event)
    currentX = clientX
    diff = ((currentX - startX) / sliderSize) * 100
    newPosition = startPosition + diff
    setPosition(newPosition)
  }
}

function onDragEnd() {
  /*
   * 防止在 mouseup 后立即触发 click，导致滑块有几率产生一小段位移
   * 不使用 preventDefault 是因为 mouseup 和 click 没有注册在同一个 DOM 上
   */
  setTimeout(async () => {
    dragging = false
    if (!isClick) {
      setPosition(newPosition)
    }
    emitChange()
  }, 0)
  window.removeEventListener('mousemove', onDragging)
  window.removeEventListener('touchmove', onDragging)
  window.removeEventListener('mouseup', onDragEnd)
  window.removeEventListener('touchend', onDragEnd)
  window.removeEventListener('contextmenu', onDragEnd)
}

function setPosition(newPosition: number) {
  if (newPosition === null || isNaN(newPosition)) return
  if (newPosition < 0) {
    newPosition = 0
  } else if (newPosition > 100) {
    newPosition = 100
  }
  let lengthPerStep = 100 / ((props.max - props.min) / props.step)
  const steps = Math.round(newPosition / lengthPerStep)
  let value = steps * lengthPerStep * (props.max - props.min) * 0.01 + props.min
  value = parseFloat(value.toFixed(0))
  if (value !== props.modelValue) {
    emit('update:modelValue', value)
  }
}

function onButtonDown(event: MouseEvent | TouchEvent) {
  if (props.disabled) return

  event.preventDefault()
  onDragStart(event)
  window.addEventListener('mousemove', onDragging)
  window.addEventListener('touchmove', onDragging)
  window.addEventListener('mouseup', onDragEnd)
  window.addEventListener('touchend', onDragEnd)
  window.addEventListener('contextmenu', onDragEnd)
}

function onSliderClick(event: MouseEvent) {
  if (props.disabled || !slider.value || dragging) return

  resetSize()
  const sliderOffsetLeft = slider.value.getBoundingClientRect().left
  setPosition(((event.clientX - sliderOffsetLeft) / sliderSize) * 100)
  emitChange()
}
</script>

<template>
  <div class="scale-slider">
    <AppPopper hover content="轨道缩小">
      <div
        class="slider-controls zoom-out"
        :class="{ disabled: props.disabled || props.modelValue === props.min }"
        title="轨道缩小"
        @click="zoomOut"
      >
        <IconZoomOut class="zoom-icon" />
      </div>
    </AppPopper>
    <div class="slider-runway" ref="slider" @click="onSliderClick">
      <div class="slider-bar" :style="barStyle"></div>
      <div
        :style="buttonStyle"
        class="slider-button"
        :class="{ disabled: props.disabled }"
        @mousedown="onButtonDown"
        @touchstart="onButtonDown"
      ></div>
    </div>
    <AppPopper hover content="轨道放大">
      <div
        class="slider-controls zoom-in"
        :class="{ disabled: props.disabled || props.modelValue === props.max }"
        @click="zoomIn"
      >
        <IconZoomIn class="zoom-icon" />
      </div>
    </AppPopper>
  </div>
</template>

<style scoped lang="scss">
.scale-slider {
  display: flex;
  align-items: center;
  height: 12px;

  .slider-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    cursor: pointer;

    &:not(.disabled):hover {
      background-color: var(--app-bg-color-extra-lighter);
    }

    &.disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .zoom-icon {
      width: 16px;
      height: 16px;
      fill: var(--app-color-white);
    }
  }

  .slider-runway {
    position: relative;
    flex: 1;
    cursor: pointer;
    width: 150px;
    margin: 0 12px;
    height: 2px;
    background-color: var(--app-bg-color-lighter);

    .slider-bar {
      width: 7%;
      height: 100%;
      left: 0%;
      background-color: var(--app-color-white);
    }

    .slider-button {
      position: absolute;
      top: -5px;
      cursor: grab;
      height: 12px;
      width: 6px;
      border-radius: 3px;
      background-color: var(--app-color-white);
      transform: translate(-50%);
      user-select: none;

      &.disabled {
        background-color: var(--app-bg-color-extra-lighter);
        cursor: not-allowed;
      }
    }
  }
}
</style>
