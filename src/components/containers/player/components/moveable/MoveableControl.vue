<script setup lang="ts">
import { ref, type ShallowReactive } from 'vue'
import { useRotatable } from './use-rotatable'

export interface MoveableAttribute {
  top: number
  left: number
  width: number
  height: number
  scale: number
  rotate: number
}

const centerCoordinate = {
  x: 0,
  y: 0
}

// const scaleCoordinate = {
//   nw: { x: 0, y: 0 },
//   ne: { x: 0, y: 0 },
//   sw: { x: 0, y: 0 },
//   se: { x: 0, y: 0 }
// }

// const rotateCoordinate = {
//   x: 0,
//   y: 0
// }

const visible = ref(false)

const { onRotate } = useRotatable()

function setCenterCoordinate(
  targetAttribute: ShallowReactive<MoveableAttribute>,
  sceneContainerRef: HTMLDivElement
) {
  const { top, left } = sceneContainerRef.getBoundingClientRect()
  centerCoordinate.x = left + targetAttribute.left + targetAttribute.width / 2
  centerCoordinate.y = top + targetAttribute.top + targetAttribute.height / 2
}

function show(
  moveTarget: HTMLDivElement,
  targetAttribute: ShallowReactive<MoveableAttribute>,
  sceneContainerRef: HTMLDivElement
) {
  visible.value = true

  setCenterCoordinate(targetAttribute, sceneContainerRef)
}

defineExpose({
  show
})
</script>

<template>
  <div v-if="visible" class="moveable-control-box">
    <!-- 暂时先用绝对定位控制，后面改成直接用宽高限制 -->
    <div class="moveable-control moveable-nw"></div>
    <div class="moveable-control moveable-ne"></div>
    <div class="moveable-control moveable-sw"></div>
    <div class="moveable-control moveable-se"></div>
    <div class="moveable-control moveable-rotation" @pointerdown="onRotate"></div>
  </div>
</template>

<style scoped lang="scss">
.moveable-control-box {
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  width: 100; // 暂时写死
  height: 100; // 暂时写死
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

    &.moveable-rotation {
      left: 50%;
      transform: translate(-50%, 50%);
      bottom: 0;
    }
  }

  .moveable-item {
    box-sizing: border-box;
  }
}
</style>
