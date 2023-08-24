<script setup lang="ts">
import { usePlayerStore } from '@/stores/player'
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { ffManager } from '@/services/ffmpeg/manager'
import { TrackItemName } from '@/types'
import type { PlayerTrackItem } from '@/services/track-item'
import type { TextTrackItem } from '@/services/track-item/text-track-item'
import { TEXT_LINE_HEIGHT_RATIO } from '@/config'
import { trackList } from '@/services/track-list/track-list'

let ctx: CanvasRenderingContext2D | null = null
let canvasWidth = 0
let canvasHeight = 0

const playerStore = usePlayerStore()

const canvasRef = ref<HTMLCanvasElement | null>(null)

enum RenderType {
  Image = 'image',
  Text = 'text'
}

interface ImageRenderData {
  type: RenderType.Image
  playerItemId: string
  imageBitmap: ImageBitmap
  sx: number
  sy: number
  sw: number
  sh: number
  dx: number
  dy: number
  dw: number
  dh: number
}

interface TextRenderData {
  type: RenderType.Text
  playerItemId: string
  w: number
  h: number
  centerX: number
  centerY: number
}

type RenderData = ImageRenderData | TextRenderData

function getDestinationPosition(item: PlayerTrackItem) {
  const { scale } = item.attribute
  const originW = item.renderSize.width.value
  const originH = item.renderSize.height.value
  const originX = item.renderSize.left.value
  const originY = item.renderSize.top.value

  const dw = originW * scale
  const dh = originH * scale
  const dx = originX + (originW - dw) / 2
  const dy = originY + (originH - dh) / 2

  return { dw, dh, dx, dy }
}

function getRenderData(currentFrame: number): Promise<RenderData>[] {
  return playerStore.playerItems.map((playerItem) => {
    return new Promise((resolve) => {
      if (playerItem.component === TrackItemName.TRACK_ITEM_TEXT) {
        const { dx, dy, dw, dh } = getDestinationPosition(playerItem)

        resolve({
          type: RenderType.Text,
          playerItemId: playerItem.id,
          w: dw,
          h: dh,
          centerX: dx + dw / 2,
          centerY: dy + dh / 2
        })
      } else if (playerItem.component === TrackItemName.TRACK_ITEM_STICKER) {
        const { name, format, width, height, frameCount } = playerItem.resource
        const filename = `${name}.${format}`
        const frameIndex = ((currentFrame - playerItem.startFrame) % frameCount) + 1
        const blobFrame = ffManager.getFrame(filename, frameIndex, format)
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
            playerItemId: playerItem.id
          }

          resolve(data)
        })
      } else if (playerItem.component === TrackItemName.TRACK_ITEM_VIDEO) {
        const { name, format, width, height } = playerItem.resource
        const filename = `${name}.${format}`
        const blobFrame = ffManager.getFrame(filename, currentFrame - playerItem.startFrame, format)
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
            playerItemId: playerItem.id
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
      const trackItem = trackList.getTrackItem(data.playerItemId) as PlayerTrackItem
      if (!trackItem) continue

      const { rotate, opacity } = trackItem.attribute

      const { imageBitmap, sx, sy, sw, sh, dx, dy, dw, dh } = data
      // 图片中心点位置
      const x = dx + dw / 2
      const y = dy + dh / 2
      const radian = (rotate * Math.PI) / 180

      ctx.save()
      ctx.globalAlpha = opacity
      ctx.translate(x, y)
      ctx.rotate(radian)
      ctx.drawImage(imageBitmap, sx, sy, sw, sh, -dw / 2, -dh / 2, dw, dh)
      ctx.translate(-x, -y)
      ctx.rotate(-radian)
      ctx.restore()
    } else if (data.type === RenderType.Text) {
      const trackItem = trackList.getTrackItem(data.playerItemId) as TextTrackItem
      if (!trackItem) continue

      const { rotate, opacity } = trackItem.attribute

      // The x-axis coordinate of the point at which to begin drawing the text, in pixels.
      // The y-axis coordinate of the baseline on which to begin drawing the text, in pixels.
      const { w, h, centerX, centerY } = data
      const text = trackItem.text.value
      const scale = trackItem.attribute.scale
      const letterSpacing =
        playerStore.sceneWidth * trackItem.textAttribute.letterSpacingRatio * scale
      const lineSpacing = playerStore.sceneHeight * trackItem.textAttribute.lineSpacingRatio * scale

      const x = -w / 2
      const y = -h / 2 + h
      const lineHeight = playerStore.sceneHeight * TEXT_LINE_HEIGHT_RATIO * scale
      const radian = (rotate * Math.PI) / 180
      const lines = text.split('\n')
      if (lines[lines.length - 1] === '') {
        lines.pop()
      }

      ctx.save()
      ctx.globalAlpha = opacity
      ctx.translate(centerX, centerY)
      ctx.rotate(radian)
      ctx.fillStyle = '#fff'
      ctx.font = `${lineHeight}px "Microsoft YaHei"`
      ctx.textAlign = 'left'

      for (let n = 0; n < lines.length; n += 1) {
        const line = lines[lines.length - n - 1]
        const arrText = line.split('')
        const lineY = y - n * lineHeight - lineSpacing * n

        let offsetX = 0
        for (let i = 0; i < arrText.length; i += 1) {
          const v = arrText[i]
          const textW = ctx.measureText(v).width
          ctx.fillText(v, x + offsetX, lineY)
          offsetX = offsetX + textW + letterSpacing
        }
      }

      ctx.translate(-centerX, -centerY)
      ctx.rotate(-radian)
      ctx.restore()
    }
  }
  rendering = false
}

const { currentFrame } = storeToRefs(playerStore)
watch(
  currentFrame,
  (currentFrame) => {
    if (!ctx) return

    render(currentFrame)
  },
  { flush: 'post' }
)

function updateCanvasSize() {
  if (!canvasRef.value) return

  const { width, height } = canvasRef.value.getBoundingClientRect()
  canvasWidth = Math.round(width)
  canvasHeight = Math.round(height)
  canvasRef.value.width = canvasWidth
  canvasRef.value.height = canvasHeight
}

// 如果仅仅只是改变属性，直接取当前帧的渲染数据（为了避免重新生成图片这个异步行为造成渲染时会闪动）
function renderForAttributeChange() {
  updateCanvasSize()

  // 直接使用现成的数据，因此需要根据当前情况更新渲染数据
  if (currentRenderData) {
    const transformData = currentRenderData.map((v) => {
      const trackItem = trackList.getTrackItem(v.playerItemId) as PlayerTrackItem
      if (!trackItem) return v

      const { dx, dy, dw, dh } = getDestinationPosition(trackItem)

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
    render(playerStore.currentFrame, transformData)
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
  renderForAttributeChange
})
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>
