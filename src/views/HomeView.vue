<script setup lang="ts">
import { onMounted, ref } from 'vue'
import HeaderContainer from '@/components/containers/header/HeaderContainer.vue'
import TrackContainer from '@/components/containers/track/TrackContainer.vue'
import PlayerContainer from '@/components/containers/player/PlayerContainer.vue'
import ResourceContainer from '@/components/containers/resource/ResourceContainer.vue'
import AttributeContainer from '@/components/containers/attribute/AttributeContainer.vue'
import ResizeLine from '@/components/containers/resize-line/ResizeLine.vue'

const minResourceContainerSize = 374
const minEditorWrapperSize = 820
const minPlayerContainerSize = 460
const minAttributeContainerSize = 360
const minPlayerWorkplaceSize = 240
const minTrackContainerSize = 210

let playerContainer: HTMLElement | null = null
let attributeContainer: HTMLElement | null = null

const playerContainerRatio = ref(0.67) // 当前播放器占player-workplace容器比例

onMounted(() => {
  const playerContainerDom = document.querySelector('.player-container') as HTMLElement
  if (playerContainerDom) {
    playerContainer = playerContainerDom
  }
  const attributeContainerDom = document.querySelector('.attribute-container') as HTMLElement
  if (attributeContainerDom) {
    attributeContainer = attributeContainerDom
  }
})

function onResize1(size: { afterSize: number }) {
  if (!playerContainer || !attributeContainer) return

  const { afterSize: playerWorkplaceSize } = size
  // 按比例放大缩小
  let playerSize = playerWorkplaceSize * playerContainerRatio.value
  playerSize = Math.min(
    Math.max(playerSize, minPlayerContainerSize),
    playerWorkplaceSize - minAttributeContainerSize
  )
  const attributeSize = playerWorkplaceSize - playerSize
  playerContainer.style.width = `${playerSize}px`
  attributeContainer.style.width = `${attributeSize}px`
}

function onResize2(size: { beforeSize: number; afterSize: number }) {
  const { beforeSize: playerSize, afterSize: attributeSize } = size
  playerContainerRatio.value = playerSize / (playerSize + attributeSize)
}
</script>

<template>
  <HeaderContainer />
  <main class="home-main">
    <ResourceContainer />
    <ResizeLine
      containerClass="home-main"
      beforeClass="resource-container"
      afterClass="editor-wrapper"
      :minBefore="minResourceContainerSize"
      :minAfter="minEditorWrapperSize"
      @resize="onResize1"
    />
    <div class="editor-wrapper">
      <div class="player-workplace">
        <PlayerContainer />
        <ResizeLine
          containerClass="player-workplace"
          beforeClass="player-container"
          afterClass="attribute-container"
          :minBefore="minPlayerContainerSize"
          :minAfter="minAttributeContainerSize"
          @resize="onResize2"
        />
        <AttributeContainer />
      </div>
      <ResizeLine
        containerClass="editor-wrapper"
        beforeClass="player-workplace"
        afterClass="track-container"
        :minBefore="minPlayerWorkplaceSize"
        :minAfter="minTrackContainerSize"
        :horizontal="true"
      />
      <TrackContainer />
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
