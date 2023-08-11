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

interface RenderData {
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

function getRenderData(currentFrame: number): Promise<RenderData>[] {
  return props.playerItems.map(
    (item) =>
      new Promise((resolve) => {
        const { trackItem } = item
        if (ctx && trackItem.component === TrackItemName.TRACK_ITEM_VIDEO) {
          const { name, format, width, height } = trackItem.resource
          const filename = `${name}.${format}`
          const blobFrame = ffManager.getFrame(filename, currentFrame - trackItem.startFrame)
          createImageBitmap(blobFrame).then((imageBitmap) => {
            const { scale } = trackItem.attribute
            const originW = item.width.value
            const originH = item.height.value
            const originX = item.left.value
            const originY = item.top.value

            const dw = originW * scale
            const dh = originH * scale
            const dx = originX + (originW - dw) / 2
            const dy = originY + (originH - dh) / 2

            const data = {
              imageBitmap,
              sx: 0,
              sy: 0,
              sw: width,
              sh: height,
              dx,
              dy,
              dw,
              dh,
              rotate: item.attribute.rotate
            }

            resolve(data)
          })
        }
      })
  )
}

let rendering = false

async function render(currentFrame: number) {
  if (currentFrame <= 1 || !ctx || rendering) return

  rendering = true
  const renderDataList = await Promise.all(getRenderData(currentFrame))

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)
  for (let i = 0; i < renderDataList.length; i += 1) {
    const data = renderDataList[i]

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
  }
  rendering = false
}

watch(playerStore.currentFrame, (currentFrame) => {
  if (!ctx) return

  render(currentFrame)
})

function update() {
  render(playerStore.currentFrame.value)
}

onMounted(() => {
  if (canvasRef.value) {
    const { width, height } = canvasRef.value.getBoundingClientRect()
    canvasWidth = Math.round(width)
    canvasHeight = Math.round(height)
    canvasRef.value.width = canvasWidth
    canvasRef.value.height = canvasHeight

    const context = canvasRef.value.getContext('2d')
    if (context) {
      ctx = context
    }
  }
})

defineExpose({
  update
})
</script>

<template>
  <canvas ref="canvasRef"></canvas>
</template>
