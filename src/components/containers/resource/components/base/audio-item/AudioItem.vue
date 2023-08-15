<script setup lang="ts">
import { draggable } from '@/services/draggable/draggable'
import { secondsToTime } from '@/services/helpers/time'
import { AudioTrackItem } from '@/services/track-item/audio-track-item'
import type { AudioResource } from '@/types'
import { computed, ref } from 'vue'
import IconMusicNote from '@/components/icons/IconMusicNote.vue'

const props = defineProps<{
  data: AudioResource
}>()

const resourceItemRef = ref<HTMLDivElement | null>(null)

const duration = computed(() => secondsToTime(Math.round(props.data.duration / 1000)))

function onDragStart(e: PointerEvent) {
  if (!resourceItemRef.value) return

  draggable.onDragStart(e, resourceItemRef.value, AudioTrackItem.create(props.data))
}
</script>

<template>
  <div ref="resourceItemRef" class="audio-item-container" @pointerdown="onDragStart">
    <div class="audio-logo">
      <div class="audio-logo-wrapper">
        <IconMusicNote class="icon-music-note" />
      </div>
    </div>
    <div class="audio-info">
      <span class="audio-name" :title="props.data.name">{{ props.data.name }}</span>
      <time class="audio-duration">{{ duration }}</time>
    </div>
  </div>
</template>

<style scoped lang="scss">
.audio-item-container {
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  box-sizing: border-box;
  width: 200px;
  height: 78px;
  background-color: var(--app-bg-color);
  border-radius: 4px;
  padding: 7px;

  .audio-logo {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    width: 64px;
    height: 64px;
    margin-right: 10px;
    border-radius: 4px;
    background-color: var(--app-bg-color-extra-lighter);

    .audio-logo-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background-color: var(--icon-color-bg);

      .icon-music-note {
        width: 24px;
        height: 24px;
        fill: var(--icon-color);
      }
    }
  }

  .audio-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
    overflow: hidden;

    .audio-name {
      font-size: var(--app-font-size-small);
      color: var(--app-text-color-regular);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .audio-duration {
      font-size: var(--app-font-size-minimum);
      color: var(--app-text-color-dark);
    }
  }
}
</style>
