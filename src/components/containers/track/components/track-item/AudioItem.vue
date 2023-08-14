<script setup lang="ts">
import { TrackItemName } from '@/types'
import TrackHandler from './TrackHandler.vue'
import type { AudioTrackItem } from '@/services/track-item/audio-track-item'
import { onMounted, ref, type ComputedRef, type CSSProperties, computed } from 'vue'
import { useResizeObserver, useThrottleFn, type ResizeObserverCallback } from '@vueuse/core'
import { draggable } from '@/services/draggable/draggable'
import { FFDir, ffManager } from '@/services/ffmpeg/manager'
import { useTimelineStore } from '@/stores/timeline'
import { OTHER_TRACK_HEIGHT } from '@/config'

defineOptions({
  name: TrackItemName.TRACK_ITEM_AUDIO
})

const props = defineProps<{
  data: AudioTrackItem
}>()

const timelineStore = useTimelineStore()

const itemContentRef = ref<HTMLDivElement>()

const waveImageUrl = ref('')

let renderingWaveform = false

async function renderWaveform(audioPath: string, name: string) {
  if (renderingWaveform) return
  renderingWaveform = true

  const { frameCount } = props.data.resource
  const width = timelineStore.frameToPixelWidth(frameCount)

  await ffManager.generateWaveform(audioPath, name, {
    width: Math.round(width),
    height: OTHER_TRACK_HEIGHT * 2,
    color: '#3B5174'
  })
  const waveImageBlob = ffManager.getWaveImageBlob(name)
  waveImageUrl.value = window.URL.createObjectURL(waveImageBlob)

  renderingWaveform = false
}

async function initAudio() {
  const { name, format, source } = props.data.resource
  const filename = `${name}.${format}`
  const { path } = await ffManager.writeFile(FFDir.RESOURCE, filename, source)
  renderWaveform(path, name)

  const onResize = useThrottleFn<ResizeObserverCallback>(
    () => {
      if (draggable.draggingState.value !== null) return

      renderWaveform(path, name)
    },
    50,
    true
  )

  useResizeObserver(itemContentRef.value, onResize)
}

const waveImageStyle: ComputedRef<CSSProperties> = computed(() => {
  const { startFrame, minFrame } = props.data
  return {
    // 向左偏移
    left: `-${timelineStore.frameToPixelWidthWithUnit(startFrame - minFrame)}`
  }
})

onMounted(() => {
  initAudio()
})
</script>

<template>
  <TrackHandler :data="props.data">
    <div class="item-content">
      <img :src="waveImageUrl" class="wave-image" :style="waveImageStyle" />
      <span class="audio-name">{{ props.data.resource.name }}</span>
    </div>
  </TrackHandler>
</template>

<style scoped lang="scss">
.item-content {
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background-color: var(--app-bg-color-audio-waveform);
  height: 100%;
  color: var(--app-color-white);
  font-size: var(--app-font-size-small);
  padding: 0 10px;
  user-select: none;
}

.audio-name {
  position: absolute;
  top: 6px;
  left: 16px;
  color: var(--app-text-color-regular);
  font-size: var(--app-font-size-minimum);
  // 解决字体无法更小的问题
  zoom: 0.8;
}

.wave-image {
  position: absolute;
  top: 0;
}
</style>
