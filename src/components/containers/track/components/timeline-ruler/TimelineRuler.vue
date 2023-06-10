<script setup lang="ts">
import { onMounted } from 'vue';
import { ref } from 'vue';

const timeline = ref<HTMLCanvasElement>()

const RATIO = window.devicePixelRatio ?? 1
const BACKGROUND_COLOR = '#fff'

function initCanvasContext() {
  if (timeline.value) {
    const ctx = timeline.value.getContext('2d')
    if (ctx) {
      ctx.font = `${13 * RATIO}px`
      ctx.lineWidth = 1
      ctx.textBaseline = 'middle'
    }
  }
}

/**
 * 思路
 * 
 * 绘制时间刻度的默认总长度为视频长度的 1.5 倍
 * 比如某个视频为 10s
 * 那么最大长度就是 15s
 * 
 * 当缩放到最小时，最大长度为当前总长度的 1.5 倍
 * 当缩放到最大时基础单位为 f（帧）
 * 
 * 当缩放到最大时一帧的宽度为 60px
 * 
 * 假如某个 30 帧，长度为 6s.20f 的视频
 * 那么总长度就是 10s
 * 
 * 假如初始 timeline 的宽度为 600px
 * 
 * frameCount = 10s * 30f = 300f，那么初始状态下 1 帧的宽度为 600px / 300f =  2px
 * 那么缩放到最大和最小时的倍数为 60px / 2px = 30
 * 
 * 放大倍数随 scale 的增大而增大
 */
type EasingFunction = (x: number) => number

/**
 * 缓动函数，计算随 scale 增大而放大的倍数
 * 
 * @param {number} frameCount 总帧数
 * @param {number} width 没有进行任何缩放时的宽度
 * @param {number} [options.frameWidth = 60] 缩放到最大时 1 帧的宽度
 */
function initEasingFunction(frameCount: number, width: number, options: { frameWidth?: number } = {}): EasingFunction {
  const { frameWidth = 60 } = options
  // 缩放到最大时需要放大的倍数
  const scale = frameWidth / (width / frameCount)
  const a = Math.pow(scale, 1 / 100)

  return (x: number): number => {
    return Math.pow(a, x)
  }
}

function drawTimelineRuler() {
  if (!timeline.value) return

  const { width: rectWidth, height } = timeline.value.getBoundingClientRect();

  const ctx = timeline.value.getContext('2d')

  if (!ctx) return

  const scaleLevel = 10;
  const frameCount = 3000

  const func = initEasingFunction(frameCount, rectWidth)
  const scale = func(scaleLevel)
  const width = rectWidth * scale;

  // 设置 canvas 大小，canvas 默认大小为 300 * 150，因此需要设置为和容器大小相同
  ctx.canvas.width = width
  ctx.canvas.height = height

  // 清空画布
  ctx.scale(RATIO, RATIO)
  ctx.clearRect(0, 0, width, height)

  // 背景色
  ctx.fillStyle = BACKGROUND_COLOR
  ctx.fillRect(0, 0, width, height)

  // 开始绘制
  // 开启路径
  ctx.beginPath()

  // 绘制长刻度


  // 绘制短刻度

  // 关闭路径
  // clearRect 不能清除路径，如果不关闭路径，下次绘制就接着上次的路径继续绘制
  ctx.closePath();

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

onMounted(() => {
  initCanvasContext()
  drawTimelineRuler()
})
</script>

<template>
  <canvas class="timeline-canvas" ref="timeline"></canvas>
</template>

<style scoped lang="scss">
.timeline-canvas {
  width: 100%;
  height: 20px;
}
</style>