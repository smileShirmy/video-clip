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
 * 以一个 10s 的视频为例
 * 
 * 当滑块在最小时，一屏的宽度为 15s
 * 当滑块在中间时，一瓶的宽度为 (15 / 2) = 7.5s
 * 当滑块在最大时，一屏的宽度为 1s （这是固定的）
 */
function drawTimelineRuler() {
  if (!timeline.value) return

  const { width, height } = timeline.value.getBoundingClientRect();

  const ctx = timeline.value.getContext('2d')

  if (!ctx) return

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