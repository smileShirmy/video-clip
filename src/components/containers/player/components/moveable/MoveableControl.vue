<script setup lang="ts">
import { ref, type ComputedRef, type CSSProperties } from 'vue'
import { useRotatable } from './use-rotatable'
import { useScalable } from './use-scalable'
import { reactive } from 'vue'
import { computed } from 'vue'
import { getRotatedPoint } from './helper'

export interface MoveableAttribute {
  top: number
  left: number
  width: number
  height: number
  scale: number
  rotate: number
}

const rotate = ref(0)
const scale = ref(1)

let halfWidth = 0
let halfHeight = 0
let notScaleHalfWidth = 0
let notScaleHalfHeight = 0

// 未缩放时边线到垂直中线的距离
let notScalableDistance = ref(0)

const moveTargetRect = {
  top: 0,
  left: 0,
  width: 0,
  height: 0
}

const sceneContainerRect = {
  top: 0,
  left: 0,
  width: 0,
  height: 0
}

const centerBoxCoordinate = reactive({
  x: 0,
  y: 0
})

const notRotatedNw = computed(() => {
  const { x: centerX, y: centerY } = centerSceneCoordinate.value
  return {
    x: centerX - notScaleHalfWidth * scale.value,
    y: centerY - notScaleHalfHeight * scale.value
  }
})

const notRotatedNe = computed(() => {
  const { x: centerX, y: centerY } = centerSceneCoordinate.value
  return {
    x: centerX + notScaleHalfWidth * scale.value,
    y: centerY - notScaleHalfHeight * scale.value
  }
})

const notRotatedSw = computed(() => {
  const { x: centerX, y: centerY } = centerSceneCoordinate.value
  return {
    x: centerX - notScaleHalfWidth * scale.value,
    y: centerY + notScaleHalfHeight * scale.value
  }
})

const notRotatedSe = computed(() => {
  const { x: centerX, y: centerY } = centerSceneCoordinate.value
  return {
    x: centerX + notScaleHalfWidth * scale.value,
    y: centerY + notScaleHalfHeight * scale.value
  }
})

const notRotatedRotation = computed(() => {
  const { x: centerX, y: centerY } = centerSceneCoordinate.value
  return {
    x: centerX,
    y: centerY + notScaleHalfHeight * scale.value + 20
  }
})

const centerViewportCoordinate = computed(() => ({
  x: centerBoxCoordinate.x + moveTargetRect.left,
  y: centerBoxCoordinate.y + moveTargetRect.top
}))

const centerSceneCoordinate = computed(() => ({
  x: centerViewportCoordinate.value.x - sceneContainerRect.left,
  y: centerViewportCoordinate.value.y - sceneContainerRect.top
}))

const rotatedNw = computed(() =>
  getRotatedPoint(notRotatedNw.value, centerBoxCoordinate, rotate.value)
)

const rotatedNe = computed(() =>
  getRotatedPoint(notRotatedNe.value, centerBoxCoordinate, rotate.value)
)

const rotatedSw = computed(() =>
  getRotatedPoint(notRotatedSw.value, centerBoxCoordinate, rotate.value)
)

const rotatedSe = computed(() =>
  getRotatedPoint(notRotatedSe.value, centerBoxCoordinate, rotate.value)
)

const rotatedRotation = computed(() =>
  getRotatedPoint(notRotatedRotation.value, centerBoxCoordinate, rotate.value)
)

const nwStyle: ComputedRef<CSSProperties> = computed(() => {
  const { x, y } = rotatedNw.value
  return {
    transform: `translate(${x}px, ${y}px)`
  }
})

const neStyle: ComputedRef<CSSProperties> = computed(() => {
  const { x, y } = rotatedNe.value
  return {
    transform: `translate(${x}px, ${y}px)`
  }
})

const swStyle: ComputedRef<CSSProperties> = computed(() => {
  const { x, y } = rotatedSw.value
  return {
    transform: `translate(${x}px, ${y}px)`
  }
})

const seStyle: ComputedRef<CSSProperties> = computed(() => {
  const { x, y } = rotatedSe.value
  return {
    transform: `translate(${x}px, ${y}px)`
  }
})

const rotationStyle: ComputedRef<CSSProperties> = computed(() => {
  const { x, y } = rotatedRotation.value
  return {
    transform: `translate(${x}px, ${y}px)`
  }
})

function initBoxCenterCoordinate() {
  centerBoxCoordinate.x = moveTargetRect.width / 2
  centerBoxCoordinate.y = moveTargetRect.height / 2
}

function initRect(moveTarget: HTMLDivElement, sceneContainerRef: HTMLDivElement) {
  const moveRect = moveTarget.getBoundingClientRect()
  moveTargetRect.width = moveRect.width
  moveTargetRect.height = moveRect.height
  moveTargetRect.top = moveRect.top
  moveTargetRect.left = moveRect.left

  const sceneRect = sceneContainerRef.getBoundingClientRect()
  sceneContainerRect.width = sceneRect.width
  sceneContainerRect.height = sceneRect.height
  sceneContainerRect.top = sceneRect.top
  sceneContainerRect.left = sceneRect.left
}

function initRotate(moveTarget: HTMLDivElement) {
  const match = moveTarget.style.transform.match(/rotate\((?<deg>\d+(\.\d+)?)deg\)/)
  if (match && match.groups?.deg) {
    rotate.value = Number(match.groups.deg)
  }
}

function initScale(moveTarget: HTMLDivElement) {
  const match = moveTarget.style.transform.match(/scale\((?<scale>\d+(\.\d+)?)\)/)
  if (match && match.groups?.scale) {
    scale.value = Number(match.groups.scale)
  }

  notScalableDistance.value = halfWidth / scale.value
  notScaleHalfWidth = halfWidth / scale.value
  notScaleHalfHeight = halfHeight / scale.value
}

/**
 * 获取未旋转前各点的坐标
 */
function initVertexCoordinate(moveTarget: HTMLDivElement) {
  const match = moveTarget.style.transform.match(
    /translate\((?<x>\d+(\.\d+)?)px, (?<y>\d+(\.\d+)?)px\)/
  )
  if (match && match.groups?.x && match.groups?.y) {
    const x = Number(match.groups.x)
    const y = Number(match.groups.y)
    const { x: centerX, y: centerY } = centerSceneCoordinate.value

    halfWidth = centerX - x
    halfHeight = centerY - y
  }
}

const visible = ref(false)

function show(moveTarget: HTMLDivElement, sceneContainerRef: HTMLDivElement) {
  visible.value = true

  // 这个顺序不能随意调换
  initRect(moveTarget, sceneContainerRef)
  initBoxCenterCoordinate()
  initVertexCoordinate(moveTarget)
  initScale(moveTarget)
  initRotate(moveTarget)
}

const { onRotate } = useRotatable(centerViewportCoordinate, rotate)

const { onScale } = useScalable(centerViewportCoordinate, scale, rotate, notScalableDistance)

defineExpose({
  show
})
</script>

<template>
  <div v-if="visible" class="moveable-control-box">
    <!-- 暂时先用绝对定位控制，后面改成直接用宽高限制 -->
    <div class="moveable-control" :style="nwStyle" @pointerdown="onScale"></div>
    <div class="moveable-control" :style="neStyle" @pointerdown="onScale"></div>
    <div class="moveable-control" :style="swStyle" @pointerdown="onScale"></div>
    <div class="moveable-control" :style="seStyle" @pointerdown="onScale"></div>
    <div class="moveable-control" :style="rotationStyle" @pointerdown="onRotate"></div>
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

  .moveable-control {
    box-sizing: border-box;
    position: absolute;
    width: 10px;
    height: 10px;
    margin-top: -5px;
    margin-left: -5px;
    border-radius: 50%;
    background-color: var(--app-color-white);
  }

  .moveable-item {
    box-sizing: border-box;
  }
}
</style>
