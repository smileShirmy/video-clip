<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = defineProps({
  // 外层容器类名
  containerClass: {
    type: String,
    required: true
  },
  // 前面容器类型
  beforeClass: {
    type: String,
    required: true
  },
  // 后面容器类型
  afterClass: {
    type: String,
    required: true
  },
  // 前面容器最小大小
  minBefore: {
    type: Number,
    default: 0
  },
  // 后面容器最小大小
  minAfter: {
    type: Number,
    default: 0
  },
  // 是否水平分隔线
  horizontal: {
    type: Boolean
  }
})

const emit = defineEmits<{
  (e: 'resize', size: { beforeSize: number; afterSize: number }): void
}>()

let container: HTMLElement | null = null
let before: HTMLElement | null = null
let after: HTMLElement | null = null
let containerRect: DOMRect | null = null

const resizeLine = ref<HTMLElement>()

onMounted(() => {
  const containerDom = document.querySelector(`.${props.containerClass}`) as HTMLElement
  if (containerDom) {
    container = containerDom
  }
  const beforeDom = document.querySelector(`.${props.beforeClass}`) as HTMLElement
  if (beforeDom) {
    before = beforeDom
  }
  const afterDom = document.querySelector(`.${props.afterClass}`) as HTMLElement
  if (afterDom) {
    after = afterDom
  }

  bindEvents()
})

function bindEvents() {
  if (!resizeLine.value) return

  resizeLine.value.onmousedown = (event) => onMouseDown(event)
}

function onMouseDown(event: MouseEvent) {
  if (!container) return

  containerRect = container.getBoundingClientRect()
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(event: MouseEvent) {
  if (!containerRect || !container || !before || !after || !resizeLine.value) return

  // 防止拖拽的时候滚动
  event.preventDefault()

  const containerSize = props.horizontal ? container.clientHeight : container.clientWidth // 外层容器大小
  let beforeSize = props.horizontal
    ? event.clientY - containerRect.top
    : event.clientX - containerRect.left // 前面容器的大小 === 鼠标相对于容器的位置
  let afterSize = 0 // 后面容器的大小
  const maxBefore = containerSize - props.minAfter
  beforeSize = Math.min(Math.max(beforeSize, props.minBefore), maxBefore)
  afterSize = containerSize - beforeSize
  before.style[props.horizontal ? 'height' : 'width'] = `${beforeSize}px`
  after.style[props.horizontal ? 'height' : 'width'] = `${afterSize}px`

  emit('resize', { beforeSize, afterSize })
}

function onMouseUp(event: MouseEvent) {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}
</script>

<template>
  <div ref="resizeLine" class="resize-line" :class="{ horizontal: props.horizontal }"></div>
</template>

<style scoped lang="scss">
.resize-line {
  flex-shrink: 0;
  width: 2px;
  height: 100%;
  background-color: #000;
  cursor: col-resize;

  &.horizontal {
    width: 100%;
    height: 2px;
    cursor: row-resize;
  }
}
</style>
