<script setup lang="ts">
import { ref } from 'vue'
import MoveableControl from './components/moveable/MoveableControl.vue'
import type { CSSProperties, ComputedRef } from 'vue'
import { vOnClickOutside } from '@/services/directives/click-outside'
import { isString } from '@/services/helpers/general'
import { watch } from 'vue'
import { onMounted } from 'vue'
import { useResizeObserver, watchThrottled } from '@vueuse/core'
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import PlayerControls from './components/player-controls/PlayerControls.vue'
import PlayerCanvas from './components/player-canvas/PlayerCanvas.vue'
import { trackList } from '@/services/track-list/track-list'
import { storeToRefs } from 'pinia'
import { PlayerItem } from '@/services/player-item/player-item'
import { useTrackStore } from '@/stores/track'
import { isPlayerTrackItem } from '@/services/track-item/helper'

const playerStore = usePlayerStore()
const trackStore = useTrackStore()

const playerContainer = ref<HTMLElement>()
const sceneContentRef = ref<HTMLDivElement | null>(null)
const sceneWrapperRef = ref<HTMLDivElement | null>(null)

const moveableControlRef = ref<InstanceType<typeof MoveableControl>>()
const playerCanvasRef = ref<InstanceType<typeof PlayerCanvas>>()

const moveableItemRef = ref<HTMLDivElement[]>([])

const SCENE_PADDING = 10 * 2

const sceneContentStyle: ComputedRef<CSSProperties> = computed(() => ({
  width: `${playerStore.sceneWidth}px`,
  height: `${playerStore.sceneHeight}px`
}))

watch(trackList.selectedId, (selectedId: string) => {
  if (!moveableControlRef.value || !(sceneContentRef.value instanceof HTMLElement)) return

  if (selectedId) {
    const targetItem = moveableItemRef.value.find((v) => v.dataset.id === selectedId)
    if (targetItem && !moveableControlRef.value.visible) {
      moveableControlRef.value.show(targetItem, sceneContentRef.value)
    }
  } else {
    moveableControlRef.value.hide()
  }
})

const { currentFrame } = storeToRefs(playerStore)
watch(currentFrame, () => {
  if (moveableControlRef.value) {
    // 如果存在选中的目标
    if (playerStore.playerSelectedItem) {
      const selectedId = playerStore.playerSelectedItem.trackItem.id

      if (!moveableControlRef.value.visible && sceneContentRef.value instanceof HTMLElement) {
        const targetItem = moveableItemRef.value.find((v) => v.dataset.id === selectedId)
        if (targetItem) {
          moveableControlRef.value.show(targetItem, sceneContentRef.value)
        }
      }
    } else {
      moveableControlRef.value.hide()
    }
  }
})

function updateSize() {
  for (const item of playerStore.playerItems) {
    item.updateAttribute()
  }

  if (moveableControlRef.value) {
    moveableControlRef.value.resizingMoveableControl()
  }
}

const { resizing } = storeToRefs(playerStore)
watch(resizing, (is, old) => {
  // 开始缩放
  if (is && !old) {
    playerStore.pause()
  }

  // 完成缩放
  if (!is && old) {
    setTimeout(() => {
      updateSize()

      if (playerCanvasRef.value) {
        playerCanvasRef.value.resize()
      }
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

// 取消选中
function onClickOutside(event: PointerEvent) {
  const target = event.target

  if (target instanceof SVGSVGElement) return

  if (target instanceof HTMLElement) {
    if (!isString(target.dataset.clearSelected)) {
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

function onRotate(rotate: number) {
  if (playerStore.playerSelectedItem) {
    playerStore.playerSelectedItem.attribute.rotate = rotate
  }
}

function onScale(scale: number) {
  if (playerStore.playerSelectedItem) {
    playerStore.playerSelectedItem.attribute.scale = scale
  }
}

function onTranslate(translate: { x: number; y: number }) {
  if (playerStore.playerSelectedItem) {
    const { x, y } = translate
    playerStore.playerSelectedItem.top.value = y
    playerStore.playerSelectedItem.left.value = x

    playerStore.playerSelectedItem.attribute.topRatio = y / playerStore.sceneHeight
    playerStore.playerSelectedItem.attribute.leftRatio = x / playerStore.sceneWidth
  }
}

const { sceneWidth } = storeToRefs(playerStore)
watchThrottled(
  sceneWidth,
  (width) => {
    if (width > 0) {
      updateSize()
    }
  },
  {
    throttle: 20,
    trailing: true
  }
)

// TODO: 这样监听的属性太多了，需要优化
const { selectedTrackItem } = storeToRefs(trackStore)
watchThrottled(
  selectedTrackItem,
  (trackItem) => {
    if (trackItem && isPlayerTrackItem(trackItem)) {
      playerCanvasRef.value?.updatePlayer()
      moveableControlRef.value?.updateMoveableControl()
    }
  },
  {
    deep: true,
    throttle: 20,
    trailing: true
  }
)

const initScene = ref(false)

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

    if (!initScene.value) {
      initScene.value = true
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
        <PlayerCanvas
          v-if="initScene"
          ref="playerCanvasRef"
          :playerItems="playerStore.playerItems"
          :style="sceneContentStyle"
        />

        <div
          v-for="(item, i) in playerStore.playerItems"
          :key="i"
          ref="moveableItemRef"
          class="moveable-item"
          :style="{
            width: `${item.width.value}px`,
            height: `${item.height.value}px`,
            transform: `translate(${item.left.value}px, ${item.top.value}px) scale(${item.attribute.scale}) rotate(${item.attribute.rotate}deg)`
          }"
          :data-id="item.trackItem.id"
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
    }
  }
}
</style>
