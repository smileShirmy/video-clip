<script setup lang="ts">
import { TrackItemName } from '@/types'
import TrackHandler from './TrackHandler.vue'
import type { VideoTrackItem } from '@/services/track-item/video-track-item'
import { FFDir, ffManager } from '@/services/ffmpeg/manager'
import { onMounted, ref, type ComputedRef, type CSSProperties, computed } from 'vue'
import { useResizeObserver, type ResizeObserverCallback, useThrottleFn } from '@vueuse/core'
import { useTimelineStore } from '@/stores/timeline'
import { draggable } from '@/services/draggable/draggable'
import {
  FPS,
  MAX_CANVAS_WIDTH,
  MAX_FRAME_WIDTH,
  VIDEO_TRACK_HEIGHT,
  VIDEO_WAVEFORM_HEIGHT,
  VIDEO_WAVEFORM_PADDING_TOP
} from '@/config'
import { secondsToTime } from '@/services/helpers/time'

defineOptions({
  name: TrackItemName.TRACK_ITEM_VIDEO
})

const timelineStore = useTimelineStore()

let oldUsedCount = 0

const props = defineProps<{
  data: VideoTrackItem
}>()

// canvas 元素缓存
const canvasCollection: HTMLCanvasElement[] = []

const itemContentRef = ref<HTMLDivElement>()

const loading = ref(false)

const waveImageUrl = ref('')

function renderCanvas(
  ctx: CanvasRenderingContext2D,
  options: {
    sourceWidth: number
    sourceHeight: number
    imageWidth: number
    filename: string
    startIndex: number
    imageCount: number
    startOffsetFrame: number
    format: string
  }
) {
  const {
    sourceWidth,
    sourceHeight,
    imageWidth,
    filename,
    startIndex,
    imageCount,
    startOffsetFrame,
    format
  } = options

  const imageBitmapPromises: Promise<ImageBitmap>[] = []

  for (let i = 0; i < imageCount; i += 1) {
    const frameIndex =
      startOffsetFrame + Math.floor(((startIndex + i) * imageWidth) / timelineStore.frameWidth)
    const blobFrame = ffManager.getFrame(filename, frameIndex + 1, format)
    imageBitmapPromises.push(createImageBitmap(blobFrame))
  }

  Promise.all(imageBitmapPromises).then((imageBitmaps) => {
    const { width, height } = ctx.canvas
    ctx.clearRect(0, 0, width, height)
    imageBitmaps.forEach((imageBitmap, i) => {
      ctx.drawImage(
        imageBitmap,
        0,
        0,
        sourceWidth,
        sourceHeight,
        i * imageWidth,
        0,
        imageWidth,
        height
      )
    })
  })
}

/**
 * 初始化 canvas，因为如果实时修改 canvas 的宽高会清空画布需要重新绘制，导致会闪
 * 因此在一开始就创建足够的 canvas，从而无需重新设置宽高
 */
function initCanvas(maxCanvasWidth: number) {
  const pushCanvas = (width: number, left: number) => {
    const canvas = document.createElement('canvas')
    canvas.style.position = 'absolute'
    canvas.style.top = '0'
    canvas.style.left = `${left}px`
    canvas.width = width
    canvas.height = VIDEO_TRACK_HEIGHT - VIDEO_WAVEFORM_HEIGHT
    canvasCollection.push(canvas)
    return canvas
  }

  const canvasWidth = props.data.resource.frameCount * MAX_FRAME_WIDTH
  const maxCanvasCount = Math.floor(canvasWidth / maxCanvasWidth)
  const lastCanvasWidth = canvasWidth % maxCanvasWidth

  for (let i = 0; i < maxCanvasCount; i += 1) {
    pushCanvas(MAX_FRAME_WIDTH, maxCanvasWidth * i)
  }

  if (lastCanvasWidth > 0) {
    pushCanvas(lastCanvasWidth, maxCanvasWidth * maxCanvasCount)
  }
}

function renderFrame(
  target: Element,
  contentRect: DOMRectReadOnly,
  filename: string,
  maxCanvasWidth: number,
  imageWidth: number,
  sourceWidth: number,
  sourceHeight: number,
  format: string
) {
  const { width } = contentRect
  // 确保整除
  // 需要用到的最大 canvas 个数
  const canvasCount = Math.ceil(width / maxCanvasWidth)
  // 被使用的 canvas 个数
  let usedCount = 0
  // 最后一个被使用的 canvas 的宽度
  const lastCanvasWidth = width % maxCanvasWidth
  const canvasImageCount = Math.round(maxCanvasWidth / imageWidth)
  const lastCanvasImageCount = Math.ceil(lastCanvasWidth / imageWidth)

  const startOffsetFrame = props.data.startFrame - props.data.minFrame

  for (let i = 0; i < canvasCount; i += 1) {
    const canvas = canvasCollection[i]
    const ctx = canvas.getContext('2d')!
    usedCount = i + 1

    // 如果当前使用的 canvas 个数的总宽度已经满足当前时间刻度的需求，则直接渲染满
    if (maxCanvasWidth * usedCount <= width) {
      renderCanvas(ctx, {
        sourceWidth,
        sourceHeight,
        imageWidth,
        filename,
        startIndex: i * canvasImageCount,
        imageCount: canvasImageCount,
        startOffsetFrame,
        format
      })
    } else {
      renderCanvas(ctx, {
        sourceWidth,
        sourceHeight,
        imageWidth,
        filename,
        startIndex: i * canvasImageCount,
        imageCount: lastCanvasImageCount,
        startOffsetFrame,
        format
      })
      break
    }
  }

  // 更新节点数量
  if (usedCount > oldUsedCount) {
    for (let i = oldUsedCount; i < usedCount; i += 1) {
      target.appendChild(canvasCollection[i])
    }
  } else {
    // 从后往前移除
    for (let i = oldUsedCount; i > usedCount; i -= 1) {
      target.removeChild(canvasCollection[i - 1])
    }
  }

  // 记录当前用到的个数
  oldUsedCount = usedCount
}

let renderingWaveform = false

async function renderWaveform(audioPath: string, name: string) {
  if (renderingWaveform) return
  renderingWaveform = true

  const { frameCount } = props.data.resource
  const width = timelineStore.frameToPixelWidth(frameCount)

  await ffManager.generateWaveform(audioPath, name, {
    width: Math.round(width),
    height: (VIDEO_WAVEFORM_HEIGHT - VIDEO_WAVEFORM_PADDING_TOP) * 2,
    color: '#666780'
  })
  const waveImageBlob = ffManager.getWaveImageBlob(name)
  waveImageUrl.value = window.URL.createObjectURL(waveImageBlob)

  renderingWaveform = false
}

function initResizeObserver(
  ratio: number,
  filename: string,
  sourceWidth: number,
  sourceHeight: number,
  audioPath: string,
  name: string,
  format: string
) {
  const imageWidth = (VIDEO_TRACK_HEIGHT - VIDEO_WAVEFORM_HEIGHT) * ratio
  // 避免 canvas 渲染到最后出现图片截断的情况
  const maxCanvasWidth = MAX_CANVAS_WIDTH - (MAX_CANVAS_WIDTH % imageWidth)

  initCanvas(maxCanvasWidth)

  const onResize = useThrottleFn<ResizeObserverCallback>(
    ([{ target, contentRect }]) => {
      if (draggable.draggingState.value !== null) return

      renderFrame(
        target,
        contentRect,
        filename,
        maxCanvasWidth,
        imageWidth,
        sourceWidth,
        sourceHeight,
        format
      )

      renderWaveform(audioPath, name)
    },
    50,
    true
  )

  useResizeObserver(itemContentRef.value, onResize)
}

async function initVideo() {
  loading.value = true

  const { name, format, source, width, height } = props.data.resource
  const filename = `${name}.${format}`
  await ffManager.writeFile(FFDir.RESOURCE, filename, source)
  const { audioPath } = await ffManager.extraAudio(filename, name)
  await ffManager.generateFrames(filename, {
    width,
    height,
    format
  })

  initResizeObserver(width / height, filename, width, height, audioPath, name, format)

  loading.value = false
}

const waveImageStyle: ComputedRef<CSSProperties> = computed(() => {
  const { startFrame, minFrame } = props.data
  return {
    // 向左偏移
    left: `-${timelineStore.frameToPixelWidthWithUnit(startFrame - minFrame)}`,
    top: `${VIDEO_TRACK_HEIGHT - VIDEO_WAVEFORM_HEIGHT + VIDEO_WAVEFORM_PADDING_TOP}px`
  }
})

const duration = computed(() => {
  const seconds = Math.round(props.data.resource.frameCount / FPS)
  return secondsToTime(seconds)
})

onMounted(() => {
  initVideo()
})
</script>

<template>
  <TrackHandler :data="props.data" v-slot="{ showHandler }" :loading="loading">
    <AppLoading v-if="loading" />
    <div v-show="!loading" class="item-content" ref="itemContentRef" data-canvas-parent></div>
    <img :src="waveImageUrl" class="wave-image" :style="waveImageStyle" />
    <time v-show="showHandler" class="video-info">{{ duration }}</time>
  </TrackHandler>
</template>

<scss scoped lang="scss">
.item-content {
  width: 100%;
  height: 100%;
  background-color: var(--app-bg-color-lighter);
}

.wave-image {
  position: absolute;
}

.video-info {
  display: inline-block;
  position: absolute;
  top: 4px;
  left: 16px;
  color: var(--app-text-color-regular);
  padding: 2px 1px;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}
</scss>
