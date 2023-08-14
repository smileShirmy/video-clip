<script setup lang="ts">
import { TrackItemName } from '@/types'
import TrackHandler from './TrackHandler.vue'
import type { VideoTrackItem } from '@/services/track-item/video-track-item'
import { FFDir, ffManager } from '@/services/ffmpeg/manager'
import { onMounted, ref } from 'vue'
import { useResizeObserver, type ResizeObserverCallback, useThrottleFn } from '@vueuse/core'
import { useTimelineStore } from '@/stores/timeline'
import { draggable } from '@/services/draggable/draggable'
import { MAX_CANVAS_WIDTH, MAX_FRAME_WIDTH, VIDEO_TRACK_HEIGHT } from '@/config'

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
  }
) {
  const {
    sourceWidth,
    sourceHeight,
    imageWidth,
    filename,
    startIndex,
    imageCount,
    startOffsetFrame
  } = options

  const imageBitmapPromises: Promise<ImageBitmap>[] = []

  for (let i = 0; i < imageCount; i += 1) {
    const frameIndex =
      startOffsetFrame + Math.floor(((startIndex + i) * imageWidth) / timelineStore.frameWidth)
    const blobFrame = ffManager.getFrame(filename, frameIndex + 1)
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
    canvas.height = VIDEO_TRACK_HEIGHT
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

function initFramePreview(
  ratio: number,
  filename: string,
  sourceWidth: number,
  sourceHeight: number
) {
  const imageWidth = VIDEO_TRACK_HEIGHT * ratio
  // 避免 canvas 渲染到最后出现图片截断的情况
  const maxCanvasWidth = MAX_CANVAS_WIDTH - (MAX_CANVAS_WIDTH % imageWidth)

  initCanvas(maxCanvasWidth)

  const onResize = useThrottleFn<ResizeObserverCallback>(
    ([{ target, contentRect }]) => {
      if (draggable.draggingState.value !== null) return

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
            startOffsetFrame
          })
        } else {
          renderCanvas(ctx, {
            sourceWidth,
            sourceHeight,
            imageWidth,
            filename,
            startIndex: i * canvasImageCount,
            imageCount: lastCanvasImageCount,
            startOffsetFrame
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
  await ffManager.generateFrames(filename, {
    width,
    height
  })

  initFramePreview(width / height, filename, width, height)

  loading.value = false
}

onMounted(() => {
  initVideo()
})
</script>

<template>
  <TrackHandler :data="props.data">
    <AppLoading class="loading" v-if="loading" />
    <div v-show="!loading" class="item-content" ref="itemContentRef" data-canvas-parent></div>
  </TrackHandler>
</template>

<scss scoped lang="scss">
.loading {
  background: rgba(255, 255, 255, 0.3);
}

.item-content {
  width: 100%;
  height: 100%;
}
</scss>
