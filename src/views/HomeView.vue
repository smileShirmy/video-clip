<script setup lang="ts">
import { onMounted, ref } from 'vue'
import HeaderContainer from '@/components/containers/header/HeaderContainer.vue'
import TrackContainer from '@/components/containers/track/TrackContainer.vue'
import PlayerContainer from '@/components/containers/player/PlayerContainer.vue'
import ResourceContainer from '@/components/containers/resource/ResourceContainer.vue'
import AttributeContainer from '@/components/containers/attribute/AttributeContainer.vue'
import ResizeLine from '@/components/containers/resize-line/ResizeLine.vue'
import {
  MIN_ATTRIBUTE_CONTAINER_WIDTH,
  MIN_EDITOR_WRAPPER_WIDTH,
  MIN_PLAYER_CONTAINER_WIDTH,
  MIN_PLAYER_WORKPLACE_HEIGHT,
  MIN_RESOURCE_CONTAINER_WIDTH,
  MIN_TRACK_CONTAINER_HEIGHT
} from '@/config'
import { useTrackStore } from '@/stores/track'

const trackStore = useTrackStore()

const playerContainerRatio = ref(0.67) // 当前播放器占player-workplace容器比例

const homeMainDom = ref<HTMLElement>()

const refResourceContainer = ref<InstanceType<typeof ResourceContainer>>()
let resourceContainerDom: HTMLElement

const editorWrapperDom = ref<HTMLElement>()

const playerWorkplaceDom = ref<HTMLElement>()

const refPlayerContainer = ref<InstanceType<typeof PlayerContainer>>()
let playerContainerDom: HTMLElement

const refAttributeContainer = ref<InstanceType<typeof AttributeContainer>>()
let attributeContainerDom: HTMLElement

const refTrackContainer = ref<InstanceType<typeof TrackContainer>>()
let trackContainerDom: HTMLElement

let editorWrapperWidth = 0

onMounted(() => {
  if (refResourceContainer.value?.resourceContainer) {
    resourceContainerDom = refResourceContainer.value.resourceContainer
  }
  if (refPlayerContainer.value?.playerContainer) {
    playerContainerDom = refPlayerContainer.value.playerContainer
  }
  if (refAttributeContainer.value?.attributeContainer) {
    attributeContainerDom = refAttributeContainer.value.attributeContainer
  }
  if (refTrackContainer.value?.trackContainerRef) {
    trackContainerDom = refTrackContainer.value.trackContainerRef
  }
})

function onResize1(size: { afterSize: number }) {
  const { afterSize: playerWorkplaceSize } = size

  // 按比例放大缩小
  let playerSize = playerWorkplaceSize * playerContainerRatio.value
  playerSize = Math.min(
    Math.max(playerSize, MIN_PLAYER_CONTAINER_WIDTH),
    playerWorkplaceSize - MIN_ATTRIBUTE_CONTAINER_WIDTH
  )
  const attributeSize = playerWorkplaceSize - playerSize
  playerContainerDom.style.width = `${playerSize}px`
  attributeContainerDom.style.width = `${attributeSize}px`
}

function addWidthTransition() {
  if (!editorWrapperDom.value) return

  resourceContainerDom.classList.add('app-width-transition')
  editorWrapperDom.value.classList.add('app-width-transition')
  playerContainerDom.classList.add('app-width-transition')
  attributeContainerDom.classList.add('app-width-transition')
}

function removeWidthTransition() {
  if (!editorWrapperDom.value) return

  resourceContainerDom.classList.remove('app-width-transition')
  editorWrapperDom.value.classList.remove('app-width-transition')
  playerContainerDom.classList.remove('app-width-transition')
  attributeContainerDom.classList.remove('app-width-transition')
}

function onResize1MouseDown() {
  trackStore.disableScroll = true

  removeWidthTransition()
}

function onResize1MouseUp() {
  trackStore.disableScroll = false

  addWidthTransition()
}

function onResize2(size: { beforeSize: number; afterSize: number }) {
  const { beforeSize: playerSize, afterSize: attributeSize } = size
  playerContainerRatio.value = playerSize / (playerSize + attributeSize)
}

function onResize2MouseDown() {
  removeWidthTransition()
}

function onResize2MouseUp() {
  addWidthTransition()
}

function resizeEditorWrapper() {
  if (!editorWrapperDom.value) return

  editorWrapperDom.value.style.width = `${editorWrapperWidth}px`
  playerContainerDom.style.width = `${editorWrapperWidth * playerContainerRatio.value}px`
  attributeContainerDom.style.width = `${editorWrapperWidth * (1 - playerContainerRatio.value)}px`
}

function onFoldResourceContainer(width: number) {
  if (!editorWrapperDom.value) return

  editorWrapperWidth = editorWrapperDom.value.clientWidth + width
  resizeEditorWrapper()
}

function onUnFoldResourceContainer(width: number) {
  if (!editorWrapperDom.value) return

  editorWrapperWidth = editorWrapperDom.value.clientWidth - width
  resizeEditorWrapper()
}
</script>

<template>
  <HeaderContainer />
  <main ref="homeMainDom" class="home-main">
    <ResourceContainer
      ref="refResourceContainer"
      @fold="onFoldResourceContainer"
      @unfold="onUnFoldResourceContainer"
    />
    <ResizeLine
      :container="homeMainDom"
      :before="resourceContainerDom"
      :after="editorWrapperDom"
      :minBefore="MIN_RESOURCE_CONTAINER_WIDTH"
      :minAfter="MIN_EDITOR_WRAPPER_WIDTH"
      @resize="onResize1"
      @mouse-down="onResize1MouseDown"
      @mouse-up="onResize1MouseUp"
    />
    <div ref="editorWrapperDom" class="editor-wrapper app-width-transition">
      <div ref="playerWorkplaceDom" class="player-workplace">
        <PlayerContainer ref="refPlayerContainer" />
        <ResizeLine
          :container="playerWorkplaceDom"
          :before="playerContainerDom"
          :after="attributeContainerDom"
          :minBefore="MIN_PLAYER_CONTAINER_WIDTH"
          :minAfter="MIN_ATTRIBUTE_CONTAINER_WIDTH"
          @resize="onResize2"
          @mouse-down="onResize2MouseDown"
          @mouse-up="onResize2MouseUp"
        />
        <AttributeContainer ref="refAttributeContainer" />
      </div>
      <ResizeLine
        :container="editorWrapperDom"
        :before="playerWorkplaceDom"
        :after="trackContainerDom"
        :minBefore="MIN_PLAYER_WORKPLACE_HEIGHT"
        :minAfter="MIN_TRACK_CONTAINER_HEIGHT"
        :horizontal="true"
      />
      <TrackContainer ref="refTrackContainer" />
    </div>
  </main>
</template>

<style scoped lang="scss">
.home-main {
  display: flex;
  height: calc(100% - 48px);

  .editor-wrapper {
    display: flex;
    flex-direction: column;
    width: calc(75% - 1px);
    overflow: hidden;

    .player-workplace {
      flex: 1;
      display: flex;
      justify-content: flex-start;
      height: 45%;
    }
  }
}
</style>
