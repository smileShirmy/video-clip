<script setup lang="ts">
import { ref } from 'vue'
import MoveableControl, { type MoveableAttribute } from './components/moveable/MoveableControl.vue'
import type { ShallowReactive } from 'vue'
import { shallowReactive } from 'vue'
import { vOnClickOutside } from '@/services/directives/click-outside'
import { isString } from '@/services/helpers/general'
import { watch } from 'vue'
import { findParent } from '@/services/helpers/dom'

const playerContainer = ref<HTMLElement>()
const sceneContainerRef = ref<HTMLDivElement | null>(null)

const moveableControlRef = ref<InstanceType<typeof MoveableControl>>()

const moveableItemRef = ref<HTMLDivElement[]>([])

const item1: ShallowReactive<MoveableAttribute> = shallowReactive({
  top: 0,
  left: 0,
  width: 100,
  height: 100,
  scale: 1,
  rotate: 0
})

const item2: ShallowReactive<MoveableAttribute> = shallowReactive({
  top: 0,
  left: 0,
  width: 100,
  height: 100,
  scale: 1,
  rotate: 0
})

const itemList = [item1, item2]

const selected = ref<ShallowReactive<MoveableAttribute> | null>(null)

watch(selected, (item) => {
  if (item === null && moveableControlRef.value) {
    moveableControlRef.value.hide()
  }
})

function select(event: PointerEvent, item: ShallowReactive<MoveableAttribute>) {
  if (
    moveableControlRef.value &&
    event.target instanceof HTMLDivElement &&
    sceneContainerRef.value instanceof HTMLDivElement
  ) {
    moveableControlRef.value.show(event.target, sceneContainerRef.value, event)
    selected.value = item
  }
}

function onClickOutside(event: PointerEvent) {
  const target = event.target

  if (target instanceof HTMLElement) {
    if (findParent(target, (el) => isString(el.dataset.moveableItem))) {
      return
    }
    if (findParent(target, (el) => isString(el.dataset.moveable))) {
      return
    }
  }

  if (moveableControlRef.value && moveableControlRef.value.inOperation) {
    return
  }

  selected.value = null
}

function onRotate(rotate: number) {
  if (selected.value) {
    selected.value.rotate = rotate
  }
}

function onScale(scale: number) {
  if (selected.value) {
    selected.value.scale = scale
  }
}

function onTranslate(translate: { x: number; y: number }) {
  if (selected.value) {
    selected.value.top = translate.y
    selected.value.left = translate.x
  }
}

defineExpose({
  playerContainer
})
</script>

<template>
  <div class="player-container app-width-transition" ref="playerContainer">
    <div class="scene-container" ref="sceneContainerRef">
      <div
        v-for="(item, i) in itemList"
        :key="i"
        ref="moveableItemRef"
        class="moveable-item"
        :style="{
          width: `${item.width}px`,
          height: `${item.height}px`,
          transform: `translate(${item.left}px, ${item.top}px) scale(${item.scale}) rotate(${item.rotate}deg)`
        }"
        data-moveable-item
        v-on-click-outside="onClickOutside"
        @pointerdown="select($event, item)"
      ></div>

      <MoveableControl
        ref="moveableControlRef"
        @rotate="onRotate"
        @scale="onScale"
        @translate="onTranslate"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.player-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 67%;
  background-color: var(--app-bg-color-dark);

  .scene-container {
    position: relative;
    width: 700px;
    height: 393.75px;
    background-color: var(--app-color-black);

    .moveable-item {
      position: absolute;
      display: inline-block;
      top: 0;
      left: 0;

      &:first-child {
        background-color: cadetblue;
      }

      &:nth-child(2) {
        background-color: darkolivegreen;
      }
    }
  }
}
</style>
