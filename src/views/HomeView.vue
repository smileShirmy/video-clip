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
import { useThrottleFn } from '@vueuse/core'

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

onMounted(async () => {
  if (refResourceContainer.value) {
    resourceContainerDom = refResourceContainer.value.$el
  }
  if (refPlayerContainer.value) {
    playerContainerDom = refPlayerContainer.value.$el
  }
  if (refAttributeContainer.value) {
    attributeContainerDom = refAttributeContainer.value.$el
  }
  if (refTrackContainer.value) {
    trackContainerDom = refTrackContainer.value.$el
  }
})

const resizeTimelineWidth = useThrottleFn(trackStore.resizeTimelineWidth, 50)

function onResize1(size: { afterSize: number }) {
  if (!playerContainerDom || !attributeContainerDom) return

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

  resizeTimelineWidth()
}

function onMouseDown() {
  trackStore.disableScroll = true
}

function onMouseUp() {
  trackStore.disableScroll = false
}

function onResize2(size: { beforeSize: number; afterSize: number }) {
  const { beforeSize: playerSize, afterSize: attributeSize } = size
  playerContainerRatio.value = playerSize / (playerSize + attributeSize)
}
</script>

<template>
  <HeaderContainer />
  <main ref="homeMainDom" class="home-main">
    <ResourceContainer ref="refResourceContainer" />
    <ResizeLine
      :container="homeMainDom"
      :before="resourceContainerDom"
      :after="editorWrapperDom"
      :minBefore="MIN_RESOURCE_CONTAINER_WIDTH"
      :minAfter="MIN_EDITOR_WRAPPER_WIDTH"
      @resize="onResize1"
      @mouse-down="onMouseDown"
      @mouse-up="onMouseUp"
    />
    <div ref="editorWrapperDom" class="editor-wrapper">
      <div ref="playerWorkplaceDom" class="player-workplace">
        <PlayerContainer ref="refPlayerContainer" />
        <ResizeLine
          :container="playerWorkplaceDom"
          :before="playerContainerDom"
          :after="attributeContainerDom"
          :minBefore="MIN_PLAYER_CONTAINER_WIDTH"
          :minAfter="MIN_ATTRIBUTE_CONTAINER_WIDTH"
          @resize="onResize2"
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
    width: 75%;
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
