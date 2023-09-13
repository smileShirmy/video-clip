<script setup lang="ts">
import { ref } from 'vue'
import MoveableControl from './components/moveable/MoveableControl.vue'
import type { CSSProperties, ComputedRef } from 'vue'
import { vOnClickOutside } from '@/services/directives/click-outside'
import { isString } from '@/services/helpers/general'
import { watch } from 'vue'
import { onMounted } from 'vue'
import { useResizeObserver, useThrottleFn, watchThrottled } from '@vueuse/core'
import { computed } from 'vue'
import { usePlayerStore } from '@/stores/player'
import PlayerControls from './components/player-controls/PlayerControls.vue'
import PlayerCanvas from './components/player-canvas/PlayerCanvas.vue'
import { trackList } from '@/services/track-list/track-list'
import { storeToRefs } from 'pinia'
import type { PlayerTrackItem } from '@/services/track-item'
import { emitter } from '@/services/mitt/emitter'
import { Events } from '@/services/mitt/emitter'
import { nextTick } from 'vue'
import { PlayerAttributeChangeAction } from '@/services/steps-manager/player-attribute-action'

const playerStore = usePlayerStore()

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

function toggleControlTargetVisible(is: boolean, selectedId: string) {
  if (!moveableControlRef.value || !(sceneContentRef.value instanceof HTMLElement)) return

  if (is) {
    const targetItem = moveableItemRef.value.find((v) => v.dataset.id === selectedId)
    if (targetItem && !moveableControlRef.value.visible) {
      moveableControlRef.value.show(targetItem, sceneContentRef.value)
    }
  } else {
    moveableControlRef.value.hide()
  }
}

// 当选中了轨道中的某个资源，播放区域的选中也要回显
watch(
  trackList.selectedId,
  () => {
    const selectedId = trackList.selectedId.value

    toggleControlTargetVisible(!!selectedId, selectedId)
  },
  {
    flush: 'post'
  }
)

// 判断当前帧是否存在选中的资源，如果存在则回显选中状态
const { currentFrame } = storeToRefs(playerStore)
watch(currentFrame, () => {
  if (moveableControlRef.value) {
    // 如果存在选中的目标
    if (playerStore.playerSelectedItem) {
      const selectedId = playerStore.playerSelectedItem.id

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

function updateMoveableSize() {
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
    updateMoveableSize()
    playerCanvasRef.value?.renderForAttributeChange()
  }
})

function select(event: PointerEvent, item: PlayerTrackItem) {
  if (
    moveableControlRef.value &&
    event.target instanceof HTMLDivElement &&
    sceneContentRef.value instanceof HTMLDivElement
  ) {
    moveableControlRef.value.show(event.target, sceneContentRef.value, event)
    trackList.setSelectedId(item.id)
  }
}

// 取消选中状态
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

function onRotateChange(newVal: number, oldVal: number) {
  if (playerStore.playerSelectedItem) {
    const { id } = playerStore.playerSelectedItem
    new PlayerAttributeChangeAction(id, {
      rotate: oldVal
    }).end({
      rotate: newVal
    })
  }
}

function onScale(scale: number) {
  if (playerStore.playerSelectedItem) {
    playerStore.playerSelectedItem.attribute.scale = scale
  }
}

function onScaleChange(newVal: number, oldVal: number) {
  if (playerStore.playerSelectedItem) {
    const { id } = playerStore.playerSelectedItem
    new PlayerAttributeChangeAction(id, {
      scale: oldVal
    }).end({
      scale: newVal
    })
  }
}

function onTranslate(translate: { x: number; y: number }) {
  if (playerStore.playerSelectedItem) {
    const { x, y } = translate
    playerStore.playerSelectedItem.attribute.topRatio = y / playerStore.sceneHeight
    playerStore.playerSelectedItem.attribute.leftRatio = x / playerStore.sceneWidth
  }
}

function onTranslateChange(newVal: { x: number; y: number }, oldVal: { x: number; y: number }) {
  if (playerStore.playerSelectedItem) {
    const { id } = playerStore.playerSelectedItem
    new PlayerAttributeChangeAction(id, {
      topRatio: oldVal.y / playerStore.sceneHeight,
      leftRatio: oldVal.x / playerStore.sceneWidth
    }).end({
      topRatio: newVal.y / playerStore.sceneHeight,
      leftRatio: newVal.x / playerStore.sceneWidth
    })
  }
}

const { sceneWidth } = storeToRefs(playerStore)
watchThrottled(
  sceneWidth,
  (width) => {
    if (width > 0) {
      updateMoveableSize()
    }
  },
  {
    throttle: 20,
    trailing: true
  }
)

// 重新渲染画布，并且更新选中控制的属性
const updatePlayerAttribute = useThrottleFn(
  () => {
    console.log('update player attribute')
    nextTick(() => {
      playerCanvasRef.value?.renderForAttributeChange()
      if (playerStore.playerSelectedItem) {
        moveableControlRef.value?.updateMoveableControl()
      }
    })
  },
  20,
  true
)

emitter.on(Events.UPDATE_PLAYER_ATTRIBUTE, updatePlayerAttribute)

// 资源的位置或开始结束帧发生改变
emitter.on(Events.UPDATE_PLAYER_ITEMS, () => {
  console.log('update player items')
  playerStore.updatePlayerItems()

  nextTick(() => {
    const { currentFrame } = playerStore
    if (trackList.selectedTrackItem.value && moveableControlRef.value) {
      const { startFrame, endFrame } = trackList.selectedTrackItem.value
      const isShow = currentFrame > startFrame && currentFrame <= endFrame
      toggleControlTargetVisible(isShow, trackList.selectedId.value)
    }

    playerCanvasRef.value?.renderForItemsChange()
    if (playerStore.playerSelectedItem) {
      moveableControlRef.value?.updateMoveableControl()
    }
  })
})

const initScene = ref(false)

onMounted(() => {
  // 监听窗口大小以设置画布大小
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
        <PlayerCanvas v-if="initScene" ref="playerCanvasRef" :style="sceneContentStyle" />

        <div
          v-for="(item, i) in playerStore.playerItems"
          :key="i"
          ref="moveableItemRef"
          class="moveable-item"
          :style="{
            width: `${item.renderSize.width.value}px`,
            height: `${item.renderSize.height.value}px`,
            transform: `translate(${item.renderSize.left.value}px, ${item.renderSize.top.value}px) scale(${item.attribute.scale}) rotate(${item.attribute.rotate}deg)`
          }"
          :data-id="item.id"
          data-moveable-item
          v-on-click-outside="onClickOutside"
          @pointerdown="select($event, item)"
        ></div>

        <MoveableControl
          ref="moveableControlRef"
          @rotate="onRotate"
          @rotate-change="onRotateChange"
          @scale="onScale"
          @scale-change="onScaleChange"
          @translate="onTranslate"
          @translate-change="onTranslateChange"
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
