<script setup lang="ts">
import { computed } from 'vue'
import { trackList } from '@/services/track-list/track-list'
import { stepsManager } from '@/services/steps-manager/steps-manager'
import ScaleSlider from './ScaleSlider.vue'
import { useTrackStore } from '@/stores/track'
import IconUndo from '@/components/icons/IconUndo.vue'
import IconRedo from '@/components/icons/IconRedo.vue'
import IconDelete from '@/components/icons/IconDelete.vue'
import IconCut from '@/components/icons/IconCut.vue'
import IconCompress from '@/components/icons/IconCompress.vue'
import IconExpand from '@/components/icons/IconExpand.vue'
import IconFirstPage from '@/components/icons/IconFirstPage.vue'
import IconArrow from '@/components/icons/IconArrow.vue'
import { DeleteTrackItemAction } from '@/services/steps-manager/delete-track-item-action'

const trackStore = useTrackStore()

const disableSplit = computed(() => {
  return trackStore.splitTrackItem === null
})

function split() {
  if (disableSplit.value) return

  trackStore.split()
}

const disableDelete = computed(() => {
  return trackList.selectedId.value === ''
})

function removeSelected() {
  if (disableDelete.value) return

  const selected = trackList.selectedTrackItem.value
  if (selected) {
    new DeleteTrackItemAction(selected.toData())
  }

  trackList.removeSelected()
}

function undo() {
  if (stepsManager.allowUndo.value) {
    stepsManager.undo()
  }
}

function redo() {
  if (stepsManager.allowRedo.value) {
    stepsManager.redo()
  }
}
</script>

<template>
  <div class="control-bar">
    <section class="control-bar-child">
      <AppPopper content="撤销" hover>
        <div
          class="control-item"
          :class="{ disabled: !stepsManager.allowUndo.value }"
          @click="undo"
        >
          <IconUndo class="icon" />
        </div>
      </AppPopper>
      <AppPopper content="重做" hover>
        <div
          class="control-item"
          :class="{
            disabled: !stepsManager.allowRedo.value
          }"
          @click="redo"
        >
          <IconRedo class="icon" />
        </div>
      </AppPopper>
      <AppPopper content="删除" hover>
        <div class="control-item" :class="{ disabled: disableDelete }" @click="removeSelected">
          <IconDelete class="icon" />
        </div>
      </AppPopper>
      <AppPopper content="分割" hover>
        <div class="control-item" :class="{ disabled: disableSplit }" @click="split">
          <IconCut class="icon" />
        </div>
      </AppPopper>
    </section>

    <section class="control-bar-child">
      <AppPopper hover :content="trackStore.enableMagnetic ? '关闭自动磁吸' : '打开自动磁吸'">
        <div
          class="track-control-item"
          :class="{ enable: trackStore.enableMagnetic }"
          @click="trackStore.switchMagnetic"
        >
          <IconExpand class="track-icon" />
        </div>
      </AppPopper>
      <AppPopper hover :content="trackStore.enableSticky ? '关闭自动吸附' : '打开自动吸附'">
        <div
          class="track-control-item"
          :class="{ enable: trackStore.enableSticky }"
          @click="trackStore.switchSticky"
        >
          <IconFirstPage class="track-icon" />
        </div>
      </AppPopper>
      <AppPopper hover :content="trackStore.enablePreviewLine ? '关闭预览线' : '打开预览线'">
        <div
          class="track-control-item"
          :class="{ enable: trackStore.enablePreviewLine }"
          @click="trackStore.switchPreviewLine"
        >
          <IconArrow class="track-icon" />
        </div>
      </AppPopper>
      <div class="split-line"></div>
      <AppPopper hover content="自适应轨道">
        <div
          class="control-item adaptive-item"
          :class="{ disabled: trackList.isEmpty.value }"
          @click="trackStore.adaptiveTrack"
        >
          <IconCompress class="icon" />
        </div>
      </AppPopper>
      <ScaleSlider v-model="trackStore.scale" :disabled="trackList.isEmpty.value" />
    </section>
  </div>
</template>

<style scoped lang="scss">
.control-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  padding: 0 12px;
  background-color: var(--app-bg-color-light);
  border-bottom: 1px solid var(--app-bg-color-blank);
  user-select: none;

  .control-bar-child {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .control-item {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 6px;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    cursor: pointer;

    &:not(.disabled):hover {
      background-color: var(--app-bg-color-extra-lighter);
    }

    &.disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .icon {
      width: 16px;
      height: 16px;
      fill: var(--app-color-white);
    }
  }

  .track-control-item {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    margin: 0 6px;
    cursor: pointer;

    &.enable {
      background-color: var(--app-bg-color-dark);

      .track-icon {
        fill: var(--app-color-theme);
      }
    }

    &:not(.enable):hover {
      background-color: var(--app-bg-color-extra-lighter);
    }

    .track-icon {
      width: 16px;
      height: 16px;
      fill: var(--app-color-white);
    }
  }

  .adaptive-item {
    margin-right: 12px;
  }

  .split-line {
    margin: 0 6px;
    width: 1px;
    height: 18px;
    background-color: var(--app-bg-color-lighter);
  }
}
</style>
