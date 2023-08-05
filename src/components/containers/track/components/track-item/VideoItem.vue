<script setup lang="ts">
import { TrackItemName } from '@/types'
import TrackHandler from './TrackHandler.vue'
import type { VideoTrackItem } from '@/services/track-item/video-track-item'
import { FFDir, ffManager } from '@/services/ffmpeg/manager'
import { onMounted, ref } from 'vue'
import { useResizeObserver, type ResizeObserverCallback, useThrottleFn } from '@vueuse/core'
import { useTimelineStore } from '@/stores/timeline'
import { draggable } from '@/services/draggable/draggable'
import { MAX_CANVAS_WIDTH } from '@/config'

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

function renderCanvas(
  ctx: CanvasRenderingContext2D,
  options: {
    sourceWidth: number
    sourceHeight: number
    width: number
    height: number
    imageWidth: number
    filename: string
    startIndex: number
    imageCount: number
  }
) {
  const { sourceWidth, sourceHeight, width, height, imageWidth, filename, startIndex, imageCount } =
    options
  // 设置画布的宽度和高度
  ctx.canvas.width = width
  ctx.canvas.height = height

  // 清空画布
  ctx.clearRect(0, 0, width, height)
  const imageBitmapPromises: Promise<ImageBitmap>[] = []

  for (let i = 0; i < imageCount; i += 1) {
    const frameIndex = Math.floor(((startIndex + i) * imageWidth) / timelineStore.frameWidth)
    const blobFrame = ffManager.getFrame(filename, frameIndex + 1)
    imageBitmapPromises.push(createImageBitmap(blobFrame))
  }

  Promise.all(imageBitmapPromises).then((imageBitmaps) => {
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

function initFramePreview(
  ratio: number,
  filename: string,
  sourceWidth: number,
  sourceHeight: number
) {
  const onResize = useThrottleFn<ResizeObserverCallback>(
    ([{ target, contentRect }]) => {
      if (draggable.draggingState.value !== null) return

      const { width, height } = contentRect
      const imageWidth = height * ratio
      // 确保整除
      const maxCanvasWidth = MAX_CANVAS_WIDTH - (MAX_CANVAS_WIDTH % imageWidth)
      // 需要用到的最大 canvas 个数
      const canvasCount = Math.ceil(width / maxCanvasWidth)
      // 被使用的 canvas 个数
      let usedCount = 0
      // 最后一个被使用的 canvas 的宽度
      const lastCanvasWidth = width % maxCanvasWidth
      const curCanvasCount = canvasCollection.length
      const canvasImageCount = Math.round(maxCanvasWidth / imageWidth)
      const lastCanvasImageCount = Math.ceil(lastCanvasWidth / imageWidth)

      for (let i = 0; i < canvasCount; i += 1) {
        // 如果当前的 canvas 数量不满足则追加新的
        if (i >= curCanvasCount) {
          canvasCollection.push(document.createElement('canvas'))
        }

        const canvas = canvasCollection[i]
        const ctx = canvas.getContext('2d')!
        usedCount = i + 1

        // 如果当前使用的 canvas 个数的总宽度已经满足当前时间刻度的需求，则直接渲染满
        if (maxCanvasWidth * usedCount <= width) {
          renderCanvas(ctx, {
            sourceWidth,
            sourceHeight,
            width: maxCanvasWidth,
            height,
            imageWidth,
            filename,
            startIndex: i * canvasImageCount,
            imageCount: canvasImageCount
          })
        } else {
          renderCanvas(ctx, {
            sourceWidth,
            sourceHeight,
            width: lastCanvasWidth,
            height,
            imageWidth,
            filename,
            startIndex: i * canvasImageCount,
            imageCount: lastCanvasImageCount
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
  const { name, format, source, width, height } = props.data.resource
  const filename = `${name}.${format}`
  await ffManager.writeFile(FFDir.RESOURCE, filename, source)
  await ffManager.generateFrames(filename, {
    width,
    height
  })

  initFramePreview(width / height, filename, width, height)
}

onMounted(() => {
  initVideo()
})
</script>

<template>
  <TrackHandler :data="props.data">
    <div class="item-content" ref="itemContentRef" data-canvas-parent></div>
  </TrackHandler>
</template>

<scss scoped lang="scss">
.item-content {
  width: 100%;
  height: 100%;
}
</scss>
