<script setup lang="ts">
import { ref } from 'vue'
import MoveableControl, { type MoveableAttribute } from './components/moveable/MoveableControl.vue'
import type { ShallowReactive } from 'vue'
import { shallowReactive } from 'vue'
import { onMounted } from 'vue'

const playerContainer = ref<HTMLElement>()
const sceneContainerRef = ref<HTMLDivElement | null>(null)

const moveableControlRef = ref<InstanceType<typeof MoveableControl>>()

const moveableItemRef = ref<HTMLDivElement[]>([])

const item: ShallowReactive<MoveableAttribute> = shallowReactive({
  top: 0,
  left: 0,
  width: 100,
  height: 100,
  scale: 1,
  rotate: 0
})

const itemList = [item]

let selected: ShallowReactive<MoveableAttribute> | null = null

function select(event: MouseEvent, item: ShallowReactive<MoveableAttribute>) {
  // TODO: 暂时注释，这里调用 show 之后参数不准确
  // if (
  //   moveableControlRef.value &&
  //   event.target instanceof HTMLDivElement &&
  //   sceneContainerRef.value instanceof HTMLDivElement
  // ) {
  //   moveableControlRef.value.show(event.target, sceneContainerRef.value)
  //   selected = item
  // }
}

function onRotate(rotate: number) {
  if (selected) {
    selected.rotate = rotate
  }
}

function onScale(scale: number) {
  if (selected) {
    selected.scale = scale
  }
}

function onTranslate(translate: { x: number; y: number }) {
  if (selected) {
    selected.top = translate.y
    selected.left = translate.x
  }
}

onMounted(() => {
  if (moveableControlRef.value && sceneContainerRef.value) {
    moveableControlRef.value.show(moveableItemRef.value[0], sceneContainerRef.value)
    selected = itemList[0]
  }
})

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
        @click="select($event, item)"
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
    height: 300px;
    background-color: var(--app-color-black);

    .moveable-item {
      top: 0;
      left: 0;
      background-color: burlywood;
    }
  }
}
</style>
