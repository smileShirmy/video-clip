<script setup lang="ts">
import { ref } from 'vue'
import IconChevronRight from '@/components/icons/IconChevronRight.vue'
import { watch } from 'vue'
import { TrackItemName } from '@/types'
import VideoPicture from './video-attribute/video-picture/VideoPicture.vue'
import StickerPicture from './sticker-attribute/sticker-picture/StickerPicture.vue'
import { useTrackStore } from '@/stores/track'
import { storeToRefs } from 'pinia'

defineOptions({
  components: {
    [VideoPicture.name]: VideoPicture,
    [StickerPicture.name]: StickerPicture
  }
})

const emit = defineEmits<{
  (e: 'fold', changedWidth: number): void
  (e: 'unfold', changedWidth: number): void
}>()

const trackStore = useTrackStore()

const attributeContainer = ref<HTMLElement>()

const isFold = ref(false)

const FOLD_WIDTH = 80

let changedWidth = 0

function fold() {
  if (!attributeContainer.value) return

  isFold.value = true

  changedWidth = attributeContainer.value.clientWidth - FOLD_WIDTH
  attributeContainer.value.style.width = `${FOLD_WIDTH}px`
  emit('fold', changedWidth)
}

function unfold() {
  if (!attributeContainer.value) return

  isFold.value = false

  attributeContainer.value.style.width = `${attributeContainer.value.clientWidth + changedWidth}px`
  emit('unfold', changedWidth)
}

function clickContainer() {
  if (isFold.value) {
    unfold()
  }
}

interface TabItem {
  component: string
  name: string
}

const tabsMap: Record<TrackItemName, TabItem[]> = {
  [TrackItemName.TRACK_ITEM_VIDEO]: [
    {
      component: VideoPicture.name,
      name: '画面'
    }
  ],
  [TrackItemName.TRACK_ITEM_AUDIO]: [],
  [TrackItemName.TRACK_ITEM_TEXT]: [],
  [TrackItemName.TRACK_ITEM_STICKER]: [
    {
      component: StickerPicture.name,
      name: '画面'
    }
  ]
}

const tabs = ref<TabItem[]>([])

const tabComponent = ref('')

const { selectedTrackItem } = storeToRefs(trackStore)
watch(
  selectedTrackItem,
  (selected) => {
    if (selected === null) {
      return
    }

    tabs.value = tabsMap[selected.component]

    const [firstTab] = tabs.value
    if (firstTab) {
      tabComponent.value = firstTab.component
    }
  },
  {
    immediate: true
  }
)

function onClickTab(tab: TabItem) {
  tabComponent.value = tab.component
}

defineExpose({
  attributeContainer
})
</script>

<template>
  <div
    class="attribute-container app-width-transition"
    ref="attributeContainer"
    @click="clickContainer"
  >
    <ul class="tabs">
      <li
        class="tab-item"
        :class="{ 'is-active': tab.component === tabComponent }"
        v-for="tab in tabs"
        :key="tab.component"
        @click.stop="onClickTab(tab)"
      >
        {{ tab.name }}
      </li>
    </ul>
    <div class="tab-content">
      <component :is="tabComponent" />
    </div>

    <div v-show="!isFold" class="fold-wrapper" @click.stop="fold">
      <IconChevronRight class="icon-chevron-right" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.attribute-container {
  box-sizing: border-box;
  position: relative;
  width: calc(33% - 1px);
  background-color: var(--app-bg-color);

  .fold-wrapper {
    position: absolute;
    top: calc(50% - 17px);
    left: 0;
    display: flex;
    align-items: center;
    width: 10px;
    height: 34px;
    background-color: var(--app-bg-color-lighter);
    border-radius: 0 4px 4px 0;
    cursor: pointer;

    &:hover {
      background-color: var(--app-bg-color-extra-lighter);
    }

    .icon-chevron-right {
      margin: 0 -4px;
      fill: var(--app-text-color-primary);
    }
  }

  .tabs {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    list-style: none;
    background-color: var(--app-bg-color-light);
    border-bottom: 1px solid var(--app-bg-color-blank);
    padding: 0 16px;
    user-select: none;

    .tab-item {
      position: relative;
      height: 32px;
      line-height: 32px;
      cursor: pointer;

      + .tab-item {
        margin-left: 24px;
      }

      &.is-active {
        color: var(--app-color-theme);

        &::after {
          display: block;
          content: '';
          position: absolute;
          width: 16px;
          height: 1px;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          background-color: var(--app-color-theme);
        }
      }
    }
  }

  .tab-content {
    padding: 16px;
  }
}
</style>
