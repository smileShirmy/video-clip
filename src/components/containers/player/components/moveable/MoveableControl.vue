<script setup lang="ts">
import { ref, type ComputedRef, type CSSProperties, computed } from 'vue'
import { useScalable } from './use-scalable'

// 参考资料 https://juejin.cn/post/7109020859490107423?searchId=202307211103117ABA13490ACDBE8E3FD5

export interface MoveableAttribute {
  top: number
  left: number
  width: number
  height: number
  scale: number
}

const visible = ref(false)

const scale = ref(1)

let width = 100
let height = 100
let top = 0
let left = 0

const sceneRect = {
  top: 0,
  left: 0
}

const { onScale } = useScalable(scale, sceneRect, {
  top,
  left,
  width,
  height
})

const moveableControlBoxStyle: ComputedRef<CSSProperties> = computed(() => {
  return {
    width: '100px',
    height: '100px',
    transform: `translate(0, 0)`
  }
})

function setAttribute(targetAttribute: MoveableAttribute) {
  scale.value = targetAttribute.scale

  top = targetAttribute.top
  left = targetAttribute.left
  width = targetAttribute.width
  height = targetAttribute.height
}

function setSceneRect(sceneContainerRef: HTMLDivElement) {
  const { top, left } = sceneContainerRef.getBoundingClientRect()
  sceneRect.top = top
  sceneRect.left = left
}

function show(
  moveTarget: HTMLDivElement,
  targetAttribute: MoveableAttribute,
  sceneContainerRef: HTMLDivElement
) {
  setAttribute(targetAttribute)
  setSceneRect(sceneContainerRef)

  visible.value = true
}

defineExpose({
  show
})
</script>

<template>
  <div v-if="visible" class="moveable-control-box" :style="moveableControlBoxStyle">
    <div class="moveable-control moveable-nw" @pointerdown="onScale"></div>
    <div class="moveable-control moveable-ne" @pointerdown="onScale"></div>
    <div class="moveable-control moveable-sw" @pointerdown="onScale"></div>
    <div class="moveable-control moveable-se" @pointerdown="onScale"></div>
  </div>
</template>

<style scoped lang="scss">
.moveable-control-box {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
  outline: 1px solid transparent;
  border: 1px solid var(--app-color-white);

  .moveable-control {
    box-sizing: border-box;
    position: absolute;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: var(--app-color-white);

    &.moveable-nw {
      top: 0;
      left: 0;
      transform: translate(-50%, -50%);
    }

    &.moveable-ne {
      top: 0;
      right: 0;
      transform: translate(50%, -50%);
    }

    &.moveable-sw {
      bottom: 0;
      left: 0;
      transform: translate(-50%, 50%);
    }

    &.moveable-se {
      bottom: 0;
      right: 0;
      transform: translate(50%, 50%);
    }
  }

  .moveable-item {
    box-sizing: border-box;
  }
}
</style>
./use-scaleable
