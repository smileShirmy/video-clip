<script setup lang="ts">
import type { PlayerItem } from '@/services/player-item/player-item'
import { usePlayerStore } from '@/stores/player'
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { ffManager } from '@/services/ffmpeg/manager'
import { TrackItemName } from '@/types'

const props = defineProps<{
  playerItems: PlayerItem[]
}>()

let ctx: CanvasRenderingContext2D | null = null
let canvasWidth = 0
let canvasHeight = 0

const playerStore = storeToRefs(usePlayerStore())

const canvasRef = ref<HTMLCanvasElement | null>(null)

enum RenderType {
  Image = 'image',
  Text = 'text'
}

interface ImageRenderData {
  type: RenderType.Image
  playerItem: PlayerItem
  imageBitmap: ImageBitmap
  sx: number
  sy: number
  sw: number
  sh: number
  dx: number
  dy: number
  dw: number
  dh: number
  rotate: number
}

interface TextRenderData {
  type: RenderType.Text
  playerItem: PlayerItem
  text: string
  w: number
  h: number
  centerX: number
  centerY: number
  rotate: number
}

type RenderData = ImageRenderData | TextRenderData

function getDestinationPosition(item: PlayerItem) {
  const { scale } = item.trackItem.attribute
  const originW = item.width.value
  const originH = item.height.value
  const originX = item.left.value
  const originY = item.top.value

  const dw = originW * scale
  const dh = originH * scale
  const dx = originX + (originW - dw) / 2
  const dy = originY + (originH - dh) / 2

  return { dw, dh, dx, dy }
}

function getRenderData(currentFrame: number): Promise<RenderData>[] {
  return props.playerItems.map((playerItem) => {
    return new Promise((resolve) => {
      const { trackItem } = playerItem

      if (trackItem.component === TrackItemName.TRACK_ITEM_TEXT) {
        const { dx, dy, dw, dh } = getDestinationPosition(playerItem)

        resolve({
          type: RenderType.Text,
          playerItem,
          text: trackItem.text.value,
          w: dw,
          h: dh,
          centerX: dx + dw / 2,
          centerY: dy + dh / 2,
          rotate: playerItem.attribute.rotate
        })
      }

      if (ctx && trackItem.component === TrackItemName.TRACK_ITEM_VIDEO) {
        const { name, format, width, height } = trackItem.resource
        const filename = `${name}.${format}`
        const blobFrame = ffManager.getFrame(filename, currentFrame - trackItem.startFrame)
        createImageBitmap(blobFrame).then((imageBitmap) => {
          const { dx, dy, dw, dh } = getDestinationPosition(playerItem)

          const data: ImageRenderData = {
            type: RenderType.Image,
            imageBitmap,
            sx: 0,
            sy: 0,
            sw: width,
            sh: height,
            dx,
            dy,
            dw,
            dh,
            rotate: playerItem.attribute.rotate,
            playerItem
          }

          resolve(data)
        })
      }
    })
  })
}

let rendering = false

let currentRenderData: RenderData[]

async function render(currentFrame: number, renderData?: RenderData[]) {
  if (currentFrame <= 1 || !ctx || rendering) return

  rendering = true
  currentRenderData = renderData ?? (await Promise.all(getRenderData(currentFrame)))

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  for (let i = 0; i < currentRenderData.length; i += 1) {
    const data = currentRenderData[i]

    if (data.type === RenderType.Image) {
      const { imageBitmap, sx, sy, sw, sh, dx, dy, dw, dh, rotate } = data
      // 图片中心点位置
      const x = dx + dw / 2
      const y = dy + dh / 2
      const radian = (rotate * Math.PI) / 180

      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(radian)
      ctx.drawImage(imageBitmap, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh)
      ctx.translate(-x, -y)
      ctx.rotate(-radian)
      ctx.restore()
    } else if (data.type === RenderType.Text) {
      // The x-axis coordinate of the point at which to begin drawing the text, in pixels.
      // The y-axis coordinate of the baseline on which to begin drawing the text, in pixels.
      const { text, w, h, centerX, centerY, rotate } = data
      const radian = (rotate * Math.PI) / 180

      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(radian)
      ctx.fillStyle = '#fff'
      ctx.font = `${h}px serif`
      ctx.fillText(text, -w / 2, -h / 2 + h)
      ctx.translate(-centerX, -centerY)
      ctx.rotate(-radian)
      ctx.restore()
    }
  }
  rendering = false
}

watch(playerStore.currentFrame, (currentFrame) => {
  if (!ctx) return

  render(currentFrame)
})

function updateCanvasSize() {
  if (!canvasRef.value) return

  const { width, height } = canvasRef.value.getBoundingClientRect()
  canvasWidth = Math.round(width)
  canvasHeight = Math.round(height)
  canvasRef.value.width = canvasWidth
  canvasRef.value.height = canvasHeight
}

function updatePlayer() {
  render(playerStore.currentFrame.value)
}

// TODO: 需要优化，文本会错位
function resize() {
  if (!ctx || !canvasRef.value) return

  updateCanvasSize()
  if (currentRenderData) {
    const scaleData = currentRenderData.map((v) => {
      const { dx, dy, dw, dh } = getDestinationPosition(v.playerItem)

      if (v.type === RenderType.Image) {
        return {
          ...v,
          dx,
          dy,
          dw,
          dh
        }
      } else if (v.type === RenderType.Text) {
        return {
          ...v,
          w: dw,
          h: dh,
          centerX: dx + dw / 2,
          centerY: dy + dh / 2
        }
      }
      return v
    })
    render(playerStore.currentFrame.value, scaleData)
  }
}

onMounted(() => {
  if (canvasRef.value) {
    updateCanvasSize()

    const context = canvasRef.value.getContext('2d')
    if (context) {
      ctx = context
    }
  }
})

defineExpose({
  updatePlayer,
  resize
})
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>
