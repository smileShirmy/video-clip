<script lang="ts">
import VideoResource from './components/video-resource/VideoResource.vue'
import TextResource from './components/text-resource/TextResource.vue'
import AudioResource from './components/audio-resource/AudioResource.vue'
import StickerResource from './components/sticker-resource/StickerResource.vue'

export default {
  components: {
    [ResourceComponentName.VIDEO_RESOURCE]: VideoResource,
    [ResourceComponentName.TEXT_RESOURCE]: TextResource,
    [ResourceComponentName.AUDIO_RESOURCE]: AudioResource,
    [ResourceComponentName.STICKER_RESOURCE]: StickerResource,
  }
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { ResourceComponentName } from './types'
import type { MenuItem } from './types'

const component = ref<ResourceComponentName>(ResourceComponentName.VIDEO_RESOURCE)

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

function selectMenu(componentName: ResourceComponentName) {
  component.value = componentName
}
</script>

<template>
  <aside class="resource-container">
    <ul class="menu-list">
      <li class="menu-item" :class="{ active: item.componentName === component }" v-for="item in menu"
        :key="item.componentName" @click="selectMenu(item.componentName)">
        <span>{{ item.name }}</span>
      </li>
    </ul>
    <div class="resource-wrapper">
      <KeepAlive>
        <component :is="component" />
      </KeepAlive>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.resource-container {
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  height: 100%;
  border-right: 1px solid var(--app-background-color);

  .menu-list {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--app-menu-background-color);

    .menu-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 80px;
      height: 60px;
      cursor: pointer;

      &.active {
        background-color: var(--app-resource-background-color);
      }
    }
  }

  .resource-wrapper {
    box-sizing: border-box;
    padding: 16px;
    min-width: 300px;
    height: 100%;
    background-color: var(--app-resource-background-color);
  }
}
</style>
