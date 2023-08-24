<script setup lang="ts">
import { ref } from 'vue'
import { ResourceComponentName } from '@/types'
import type { MenuItem } from '@/types'
import VideoResource from './components/video-resource/VideoResource.vue'
import TextResource from './components/text-resource/TextResource.vue'
import AudioResource from './components/audio-resource/AudioResource.vue'
import StickerResource from './components/sticker-resource/StickerResource.vue'
import IconChevronLeft from '@/components/icons/IconChevronLeft.vue'
import IconPhotoLibrary from '@/components/icons/IconPhotoLibrary.vue'
import IconLibraryMusic from '@/components/icons/IconLibraryMusic.vue'
import IconTitle from '@/components/icons/IconTitle.vue'
import IconVideoLibrary from '@/components/icons/IconVideoLibrary.vue'

defineOptions({
  components: {
    [ResourceComponentName.VIDEO_RESOURCE]: VideoResource,
    [ResourceComponentName.TEXT_RESOURCE]: TextResource,
    [ResourceComponentName.AUDIO_RESOURCE]: AudioResource,
    [ResourceComponentName.STICKER_RESOURCE]: StickerResource,
    [ResourceComponentName.VIDEO_RESOURCE + 'Icon']: IconVideoLibrary,
    [ResourceComponentName.TEXT_RESOURCE + 'Icon']: IconTitle,
    [ResourceComponentName.AUDIO_RESOURCE + 'Icon']: IconLibraryMusic,
    [ResourceComponentName.STICKER_RESOURCE + 'Icon']: IconPhotoLibrary
  }
})

const emit = defineEmits<{
  (e: 'fold', changedWidth: number): void
  (e: 'unfold', changedWidth: number): void
}>()

const component = ref<ResourceComponentName | ''>(ResourceComponentName.VIDEO_RESOURCE)

const resourceContainer = ref<HTMLElement>()

const resourceWrapper = ref<HTMLElement>()

const isFold = ref(false)

let changedWidth = 0

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
  if (isFold.value) {
    unfold()
  }
}

function fold() {
  if (!resourceContainer.value || !resourceWrapper.value) return

  changedWidth = resourceWrapper.value.clientWidth
  resourceContainer.value.style.width = `${resourceContainer.value.clientWidth - changedWidth}px`
  emit('fold', changedWidth)

  isFold.value = true
}

function unfold() {
  if (!resourceContainer.value || !resourceWrapper.value) return

  resourceContainer.value.style.width = `${resourceContainer.value.clientWidth + changedWidth}px`
  emit('unfold', changedWidth)

  isFold.value = false
}

defineExpose({
  resourceContainer
})
</script>

<template>
  <aside ref="resourceContainer" class="resource-container app-width-transition">
    <ul class="menu-list">
      <li
        class="menu-item"
        :class="{ active: item.componentName === component && !isFold }"
        v-for="item in menu"
        :key="item.componentName"
        @click="selectMenu(item.componentName)"
      >
        <component class="menu-item-icon" :is="item.componentName + 'Icon'" />
        <span>{{ item.name }}</span>
      </li>
    </ul>

    <Transition name="collapse">
      <div v-show="!isFold" class="resource-wrapper" ref="resourceWrapper" data-clear-selected>
        <KeepAlive>
          <component :is="component" />
        </KeepAlive>
      </div>
    </Transition>

    <div v-show="!isFold" class="fold-wrapper" @click="fold">
      <IconChevronLeft class="icon-chevron-left" />
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
  user-select: none;

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
        color: var(--app-color-theme);

        .menu-item-icon {
          fill: var(--app-color-theme);
        }
      }

      .menu-item-icon {
        width: 20px;
        height: 20px;
        margin-bottom: 6px;
        fill: var(--app-text-color-primary);
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
    background-color: var(--app-bg-color-lighter);
    border-radius: 4px 0 0 4px;
    cursor: pointer;

    &:hover {
      background-color: var(--app-bg-color-extra-lighter);
    }

    .icon-chevron-left {
      margin: 0 -4px;
      fill: var(--app-text-color-primary);
    }
  }

  .collapse-enter-active,
  .collapse-leave-active {
    transition: all 0.3s ease-in-out;
  }

  .collapse-enter-from,
  .collapse-leave-to {
    transform: translateX(-40px);
    opacity: 0;
  }
}
</style>
