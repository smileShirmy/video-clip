<script setup lang="ts">
import { hoursToTime, minutesToTime, secondsToTime } from '@/services/helpers/time'
import { onMounted } from 'vue'
import { ref } from 'vue'

const timeline = ref<HTMLCanvasElement>()
const ruler = ref<HTMLDivElement>()

const RATIO = window.devicePixelRatio ?? 1
const BACKGROUND_COLOR = 'transparent'

/**
 * 缩放思路
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
 *
 * 备注：canvas 的宽度是有上限的，因此如果宽度太长时需要拼接多个 canvas
 */
type EasingFunction = (x: number) => number

/**
 * 缓动函数，计算随 scale 增大而放大的倍数
 *
 * @param {number} minFrameWidth 没有进行任何缩放时 1 帧的宽度
 * @param {number} [options.frameWidth = 60] 缩放到最大时 1 帧的宽度
 */
function initEasingFunction(
  minFrameWidth: number,
  options: { maxFrameWidth?: number } = {}
): EasingFunction {
  const { maxFrameWidth = 60 } = options
  // 缩放到最大时需要放大的倍数
  const scale = maxFrameWidth / minFrameWidth

  // 指数函数
  const a = Math.pow(scale, 1 / 100)
  return (x: number) => Math.pow(a, x)
}

/**
 * 带显示单位的长刻度计算思路
 *
 * 假如宽度为 600px，初始状态可编辑区域为10分钟，也就是 10*60*30 = 18000f
 * 那么每f的宽度为 600/18000 = 1/30
 *
 * 刻度的最小间距范围为 12px
 *
 * 长刻度（会把显示数值显示出来）之间的距离至少为（12*10）px，一旦某个等级满足 120 就使用这个等级来进行计算
 * 然后再把这个等级进行 10 等分
 *
 * 分钟级：1分钟 2分钟 3分钟 4分钟 ... 以此类推
 * 秒级：30s 20s 10s 5s 2s 1s
 * 帧级：
 * 15f 10f
 * 5f（5 等分，当每帧宽度大于 60px 的时候转为 2f 级）
 * 2f（2 等分）
 *
 * 因此从最小开始计算，获取刚好满足 120px 的等级
 */
enum longScaleType {
  FRAME = 'f',
  SECOND = 's',
  MINUTE = 'm',
  HOUR = 'h'
}
/**
 * 获取刻度信息
 *
 * @param frameWidth
 */
function getIntervalConfig(frameWidth: number): {
  type: longScaleType
  level: number
  intervalWidth: number
  parts: number
} {
  // 长刻度最小间距
  const LONG_INTERVAL_MIN_WIDTH = 120

  // 每个长刻度进行多少等分
  const PER_LONE_INTERVAL_PARTS = 10

  // 帧
  const frames = [2, 5, 10, 15]
  for (const level of frames) {
    const w = level * frameWidth
    if (w > LONG_INTERVAL_MIN_WIDTH) {
      // 2 帧进行 2 等分, 5 帧进行 5 等分, 大于 10 帧进行 10 等分
      const parts = level < PER_LONE_INTERVAL_PARTS ? level : PER_LONE_INTERVAL_PARTS
      return {
        type: longScaleType.FRAME,
        level,
        parts,
        intervalWidth: w / parts
      }
    }
  }

  // 秒
  const secondFrames = [1, 2, 5, 10, 20, 30]
  for (const level of secondFrames) {
    const w = level * 30 * frameWidth
    if (w > LONG_INTERVAL_MIN_WIDTH) {
      return {
        type: longScaleType.SECOND,
        level,
        parts: PER_LONE_INTERVAL_PARTS,
        intervalWidth: w / PER_LONE_INTERVAL_PARTS
      }
    }
  }

  // 分钟（每秒 30f，那么 1 分钟就是 1800f）
  const minuteFrames = [1, 2, 5, 10, 20, 30]
  for (const level of minuteFrames) {
    const w = level * 1800 * frameWidth
    if (w > LONG_INTERVAL_MIN_WIDTH) {
      return {
        type: longScaleType.MINUTE,
        level,
        parts: PER_LONE_INTERVAL_PARTS,
        intervalWidth: w / PER_LONE_INTERVAL_PARTS
      }
    }
  }

  // 小时（每秒 30f，那么 1 小时就是 108000f)
  let i = 0
  let w = 0

  do {
    i += 1
    w = i * 108000 * frameWidth
  } while (w < LONG_INTERVAL_MIN_WIDTH)

  return {
    type: longScaleType.HOUR,
    level: i,
    parts: PER_LONE_INTERVAL_PARTS,
    intervalWidth: w / PER_LONE_INTERVAL_PARTS
  }
}

/**
 * 获取长刻度显示的时间文字
 *
 * @param {number} index 序号
 * @param {number} level 长刻度类型值
 * @param {longScaleType} type 类型
 */
function formatIntervalTime(index: number, level: number, type: longScaleType): string {
  if (index === 0) return '00:00'

  if (type === longScaleType.FRAME) {
    const frames = index * level
    // 如果刚好满足秒数显示条件则进行格式化显示具体时间
    if (frames % 30 === 0) {
      return secondsToTime(frames / 30)
    }
    return `${(index * level) % 30}f`
  }

  if (type === longScaleType.SECOND) {
    return secondsToTime(index * level)
  }

  if (type === longScaleType.MINUTE) {
    return minutesToTime(index * level)
  }

  return hoursToTime(index * level)
}

function drawTimelineRuler() {
  if (!ruler.value || !timeline.value) return

  const { width: rectWidth, height } = ruler.value.getBoundingClientRect()

  const ctx = timeline.value.getContext('2d')

  if (!ctx) return

  const scaleLevel = 10
  const frameCount = 20

  // 计算放大倍数及放大后的宽度
  const minFrameWidth = rectWidth / frameCount
  const func = initEasingFunction(minFrameWidth)
  const scale = func(scaleLevel)
  const width = rectWidth * scale

  // 设置 canvas 大小，canvas 默认大小为 300 * 150，因此需要设置为和容器大小相同
  ctx.canvas.width = width
  ctx.canvas.height = height

  // 清空画布
  ctx.scale(RATIO, RATIO)
  ctx.clearRect(0, 0, width, height)

  // canvas 背景色
  ctx.fillStyle = BACKGROUND_COLOR
  ctx.fillRect(0, 0, width, height)

  // 根据当前缩放等级下的帧宽度获取长刻度信息
  const { type, level, intervalWidth, parts } = getIntervalConfig(minFrameWidth * scale)

  // 绘制刻度
  ctx.lineWidth = 1

  // 短刻度的高度
  const INTERVAL_HEIGHT = 7
  // 长刻度高度
  const LONG_INTERVAL_HEIGHT = 13

  // 记录长刻度的 x 轴
  const longIntervalXList: number[] = []

  /**
   * 绘制短刻度 start
   */
  ctx.beginPath()

  ctx.strokeStyle = '#666'

  const count = Math.floor(width / intervalWidth)
  for (let i = 0; i < count; i += 1) {
    // TODO: 优化 x 的取值
    // prevent canvas 1px line blurry
    const x = Math.floor(intervalWidth * i) + 0.5

    // 保存长刻度的 x 轴位置
    if (i % parts === 0) {
      longIntervalXList.push(x)
    }

    ctx.moveTo(x, 0)
    ctx.lineTo(x, INTERVAL_HEIGHT)
  }
  ctx.stroke()

  ctx.closePath()
  /**
   * 绘制短刻度 end
   */

  /**
   * 绘制长刻度 start
   * 因为长刻度的刻度线颜色和文本颜色跟短刻度不同，因此单独绘制
   */
  ctx.beginPath()

  ctx.strokeStyle = '#999'
  ctx.fillStyle = '#999'
  ctx.font = `${13 * RATIO}px sans-serif`
  ctx.lineWidth = 1
  ctx.textBaseline = 'middle'

  const l = longIntervalXList.length
  for (let i = 0; i < l; i += 1) {
    const x = longIntervalXList[i]
    ctx.moveTo(x, 0)
    ctx.save()
    ctx.translate(x + 4, LONG_INTERVAL_HEIGHT + 2)
    const text = formatIntervalTime(i, level, type)
    ctx.fillText(text, 0, 0)
    ctx.restore()
    ctx.lineTo(x, LONG_INTERVAL_HEIGHT)
  }
  ctx.stroke()

  // clearRect 不能清除路径，如果不关闭路径，下次绘制就接着上次的路径继续绘制
  ctx.closePath()
  /**
   * 绘制长刻度 end
   */

  ctx.setTransform(1, 0, 0, 1, 0, 0)
}

onMounted(() => {
  drawTimelineRuler()
})
</script>

<template>
  <div class="timeline-ruler" ref="ruler">
    <canvas class="timeline-canvas" ref="timeline"></canvas>
  </div>
</template>

<style scoped lang="scss">
.timeline-ruler {
  width: 100%;
  height: 30px;
}
</style>
