<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'

const props = defineProps({
  // 外层容器
  container: {
    type: HTMLElement
  },
  // 前面容器
  before: {
    type: HTMLElement
  },
  // 后面容器
  after: {
    type: HTMLElement
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

let containerRect: DOMRect | null = null

const resizeLine = ref<HTMLElement>()

// 直接修改props的值会报错，通过computed转换
const doms = computed(() => {
  return {
    before: props.before,
    after: props.after
  }
})

onMounted(() => {
  bindEvents()
})

function bindEvents() {
  if (!resizeLine.value) return

  resizeLine.value.onmousedown = (event) => onMouseDown(event)
}

function onMouseDown(event: MouseEvent) {
  if (!props.container) return

  containerRect = props.container.getBoundingClientRect()
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

function onMouseMove(event: MouseEvent) {
  if (!containerRect || !props.container || !doms.value.before || !doms.value.after) return

  // 防止拖拽的时候滚动
  event.preventDefault()

  const containerSize = props.horizontal
    ? props.container.clientHeight
    : props.container.clientWidth // 外层容器大小
  let beforeSize = props.horizontal
    ? event.clientY - containerRect.top
    : event.clientX - containerRect.left // 前面容器的大小 === 鼠标相对于容器的位置
  let afterSize = 0 // 后面容器的大小
  const maxBefore = containerSize - props.minAfter
  beforeSize = Math.min(Math.max(beforeSize, props.minBefore), maxBefore)
  afterSize = containerSize - beforeSize
  doms.value.before.style[props.horizontal ? 'height' : 'width'] = `${beforeSize}px`
  doms.value.after.style[props.horizontal ? 'height' : 'width'] = `${afterSize}px`

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
  position: relative;
  flex-shrink: 0;
  width: 1px;
  height: 100%;
  background-color: var(--app-bg-color-dark);

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: calc(50% - 5px);
    width: 10px;
    height: 100%;
    cursor: col-resize;
  }

  &.horizontal {
    width: 100%;
    height: 1px;

    &::after {
      content: '';
      position: absolute;
      top: calc(50% - 5px);
      left: 0;
      width: 100%;
      height: 10px;
      cursor: row-resize;
    }
  }
}
</style>
