<script setup lang="ts">
import { ref } from 'vue'
import MoveableControl, { type MoveableAttribute } from './components/moveable/MoveableControl.vue'
import type { ShallowReactive } from 'vue'
import { shallowReactive } from 'vue'

const playerContainer = ref<HTMLElement>()
const sceneContainerRef = ref<HTMLDivElement | null>(null)

const moveableControlRef = ref<InstanceType<typeof MoveableControl>>()

const item: ShallowReactive<MoveableAttribute> = shallowReactive({
  top: 0,
  left: 0,
  width: 100,
  height: 100,
  scale: 1
})

const itemList = [item]

function select(event: MouseEvent, attribute: MoveableAttribute) {
  if (
    moveableControlRef.value &&
    event.target instanceof HTMLDivElement &&
    sceneContainerRef.value instanceof HTMLDivElement
  ) {
    moveableControlRef.value.show(event.target, attribute, sceneContainerRef.value)
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
        class="moveable-item"
        :style="{
          top: `${item.top}px`,
          left: `${item.left}px`,
          width: `${item.width}px`,
          height: `${item.height}px`,
          transform: `scale(${item.scale})`
        }"
        @click="select($event, item)"
      ></div>

      <MoveableControl ref="moveableControlRef" />
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
  }
}
</style>
