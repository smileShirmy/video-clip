<script setup lang="ts">
import { ref } from 'vue'
import MoveableControl from './components/moveable/MoveableControl.vue'
import type { CSSProperties, ComputedRef } from 'vue'
import { shallowReactive } from 'vue'
import { vOnClickOutside } from '@/services/directives/click-outside'
import { isString } from '@/services/helpers/general'
import { watch } from 'vue'
import { findParent } from '@/services/helpers/dom'
import { onMounted } from 'vue'
import { useResizeObserver, watchThrottled } from '@vueuse/core'
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import PlayerControls from './components/player-controls/PlayerControls.vue'
import PlayerCanvas from './components/player-canvas/PlayerCanvas.vue'
import { trackList } from '@/services/track-list/track-list'
import type { PlayerTrackItem } from '@/services/track-item'
import { storeToRefs } from 'pinia'
import { PlayerItem } from '@/services/player-item/player-item'

const playerStore = usePlayerStore()

const playerContainer = ref<HTMLElement>()
const sceneContentRef = ref<HTMLDivElement | null>(null)
const sceneWrapperRef = ref<HTMLDivElement | null>(null)

const moveableControlRef = ref<InstanceType<typeof MoveableControl>>()

const moveableItemRef = ref<HTMLDivElement[]>([])

const createPlayerItem = (trackItem: PlayerTrackItem): PlayerItem => {
  return new PlayerItem(trackItem, playerStore)
}

const playerItems = shallowReactive<PlayerItem[]>([])

const SCENE_PADDING = 10 * 2

const sceneContentStyle: ComputedRef<CSSProperties> = computed(() => ({
  width: `${playerStore.sceneWidth}px`,
  height: `${playerStore.sceneHeight}px`
}))

watch(trackList.selectedId, (item) => {
  if (item === null && moveableControlRef.value) {
    moveableControlRef.value.hide()
  }
})

let startSceneWidth = 0

function updateSize() {
  // 缩放比例
  const ratio = playerStore.sceneWidth / startSceneWidth

  for (const item of playerItems) {
    item.updateAttribute(ratio)
  }

  if (moveableControlRef.value) {
    moveableControlRef.value.resizingMoveableControl()
  }
}

const { resizing } = storeToRefs(playerStore)
watch(resizing, (is, old) => {
  // 开始缩放
  if (is && !old) {
    startSceneWidth = playerStore.sceneWidth

    for (const item of playerItems) {
      item.recordStartAttribute()
    }
  }

  // 完成缩放
  if (!is && old) {
    setTimeout(() => {
      updateSize()
    })
  }
})

function select(event: PointerEvent, item: PlayerItem) {
  if (
    moveableControlRef.value &&
    event.target instanceof HTMLDivElement &&
    sceneContentRef.value instanceof HTMLDivElement
  ) {
    moveableControlRef.value.show(event.target, sceneContentRef.value, event)
    trackList.setSelectedId(item.trackItem.id)
  }
}

const { currentFrame } = storeToRefs(playerStore)
watch(currentFrame, (currentFrame) => {
  playerItems.length = 0
  const items = trackList.getCurrentFramePlayItems(currentFrame)
  if (items.length) {
    items.forEach((trackItem) => {
      playerItems.push(createPlayerItem(trackItem))
    })
  }
})

// 取消选中
function onClickOutside(event: PointerEvent) {
  const target = event.target

  // 不能取消选中的目标元素
  if (target instanceof HTMLElement) {
    if (findParent(target, (el) => isString(el.dataset.moveableItem))) {
      return
    }
    if (findParent(target, (el) => isString(el.dataset.moveable))) {
      return
    }
  }

  // 正在操作目标元素
  if (moveableControlRef.value && moveableControlRef.value.inOperation) {
    return
  }

  // 正在缩放舞台区域
  if (playerStore.resizing) return

  trackList.selectedId.value = ''
}

const selectedPlayerItem = computed(() => {
  const exist = playerItems.find((item) => item.trackItem.id === trackList.selectedId.value)
  return exist ?? null
})

function onRotate(rotate: number) {
  if (selectedPlayerItem.value) {
    selectedPlayerItem.value.attribute.rotate = rotate
  }
}

function onScale(scale: number) {
  if (selectedPlayerItem.value) {
    selectedPlayerItem.value.attribute.scale = scale
  }
}

function onTranslate(translate: { x: number; y: number }) {
  if (selectedPlayerItem.value) {
    selectedPlayerItem.value.top.value = translate.y
    selectedPlayerItem.value.left.value = translate.x
  }
}

const { sceneWidth } = storeToRefs(playerStore)
watchThrottled(
  sceneWidth,
  (width) => {
    if (width > 0 && startSceneWidth > 0) {
      updateSize()
    }
  },
  {
    throttle: 20,
    trailing: true
  }
)

onMounted(() => {
  useResizeObserver(sceneWrapperRef.value, ([{ contentRect }]) => {
    const { width, height } = contentRect
    const ratio = playerStore.aspectRatio

    if (width / height > ratio) {
      playerStore.sceneHeight = height - SCENE_PADDING
      playerStore.sceneWidth = height * ratio - SCENE_PADDING
    } else {
      playerStore.sceneWidth = width - SCENE_PADDING
      playerStore.sceneHeight = width / ratio - SCENE_PADDING
    }
  })
})

defineExpose({
  playerContainer
})
</script>

<template>
  <div class="player-container app-width-transition" ref="playerContainer">
    <div class="scene-wrapper" ref="sceneWrapperRef">
      <div class="scene-content" ref="sceneContentRef" :style="sceneContentStyle">
        <PlayerCanvas class="player-canvas" />

        <div
          v-for="(item, i) in playerItems"
          :key="i"
          ref="moveableItemRef"
          class="moveable-item"
          :style="{
            width: `${item.width.value}px`,
            height: `${item.height.value}px`,
            transform: `translate(${item.left.value}px, ${item.top.value}px) scale(${item.attribute.scale}) rotate(${item.attribute.rotate}deg)`
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

    <PlayerControls />
  </div>
</template>

<style scoped lang="scss">
.player-container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: 67%;
  background-color: var(--app-bg-color-dark);

  .player-canvas {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }

  .scene-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 1;
    width: 100%;
  }

  .scene-content {
    position: relative;
    margin: auto;
    background-color: var(--app-color-black);

    .moveable-item {
      display: inline-block;
      position: absolute;
      left: 0;
      top: 0;

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
