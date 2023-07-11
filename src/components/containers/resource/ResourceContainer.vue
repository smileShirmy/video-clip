<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ResourceComponentName } from '@/types'
import type { MenuItem } from '@/types'
import VideoResource from './components/video-resource/VideoResource.vue'
import TextResource from './components/text-resource/TextResource.vue'
import AudioResource from './components/audio-resource/AudioResource.vue'
import StickerResource from './components/sticker-resource/StickerResource.vue'

defineOptions({
  components: {
    [ResourceComponentName.VIDEO_RESOURCE]: VideoResource,
    [ResourceComponentName.TEXT_RESOURCE]: TextResource,
    [ResourceComponentName.AUDIO_RESOURCE]: AudioResource,
    [ResourceComponentName.STICKER_RESOURCE]: StickerResource
  }
})

const emit = defineEmits<{
  (e: 'fold', width: number): void
  (e: 'unfold', width: number): void
}>()

const component = ref<ResourceComponentName | ''>(ResourceComponentName.VIDEO_RESOURCE)

const resourceContainer = ref<HTMLElement>()

const resourceWrapper = ref<HTMLElement>()

const isFold = ref(false)

let resourceContainerWidth = 0
let resourceWrapperWidth = 0

const menu: MenuItem[] = [
  {
    componentName: ResourceComponentName.VIDEO_RESOURCE,
    name: '素材库'
  },
  {
    componentName: ResourceComponentName.TEXT_RESOURCE,
    name: '文本'
  },
  {
    componentName: ResourceComponentName.AUDIO_RESOURCE,
    name: '音频'
  },
  {
    componentName: ResourceComponentName.STICKER_RESOURCE,
    name: '贴纸'
  }
]

onMounted(() => {
  resourceContainerWidth = resourceContainer.value?.clientWidth ?? 0
  resourceWrapperWidth = resourceWrapper.value?.clientWidth ?? 0
})

function selectMenu(componentName: ResourceComponentName) {
  component.value = componentName
  if (isFold.value) {
    unfold()
  }
}

function fold() {
  if (!resourceContainer.value || !resourceWrapper.value) return

  resourceContainerWidth -= resourceWrapperWidth
  resourceContainer.value.style.width = `${resourceContainerWidth}px`
  emit('fold', resourceWrapperWidth)

  isFold.value = true
}

function unfold() {
  if (!resourceContainer.value || !resourceWrapper.value) return

  resourceContainerWidth += resourceWrapperWidth
  resourceContainer.value.style.width = `${resourceContainerWidth}px`
  emit('unfold', resourceWrapperWidth)

  isFold.value = false
}

defineExpose({
  resourceContainer
})
</script>

<template>
  <aside ref="resourceContainer" class="resource-container">
    <ul class="menu-list">
      <li
        class="menu-item"
        :class="{ active: item.componentName === component && !isFold }"
        v-for="item in menu"
        :key="item.componentName"
        @click="selectMenu(item.componentName)"
      >
        <span>{{ item.name }}</span>
      </li>
    </ul>
    <div v-show="!isFold" class="resource-wrapper" ref="resourceWrapper">
      <KeepAlive>
        <component :is="component" />
      </KeepAlive>
    </div>

    <div v-show="!isFold" class="fold-wrapper" @click="fold">
      <i class="fold-icon"></i>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.resource-container {
  box-sizing: border-box;
  position: relative;
  display: flex;
  justify-content: flex-start;
  width: 25%;
  height: 100%;

  .menu-list {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--app-bg-color);

    .menu-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 80px;
      height: 60px;
      cursor: pointer;

      &.active {
        background-color: var(--app-bg-color-light);
      }
    }
  }

  .resource-wrapper {
    box-sizing: border-box;
    padding: 16px;
    width: calc(100% - 80px);
    height: 100%;
    background-color: var(--app-bg-color-light);
  }

  .fold-wrapper {
    position: absolute;
    top: calc(45% + 30px);
    right: 0;
    display: flex;
    align-items: center;
    width: 10px;
    height: 34px;
    background-color: #37384b;
    border-radius: 4px 0 0 4px;
    cursor: pointer;

    .fold-icon {
      position: relative;
      display: inline-block;
      width: 0;
      height: 0;
      border: 6px solid transparent;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-left: 3px solid transparent;
      border-right: 3px solid #7a7d8d;

      &::after {
        content: '';
        position: absolute;
        left: -2px;
        top: -6px;
        display: inline-block;
        width: 0;
        height: 0;
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
        border-left: 3px solid transparent;
        border-right: 3px solid #37384b;
      }
    }
  }
}
</style>
