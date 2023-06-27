import { defineStore } from 'pinia'
import { hoursToTime, minutesToTime, secondsToTime } from '@/services/helpers/time'
import { warn } from '@/services/helpers/warn'
import { ref } from 'vue'

// 长刻度单位
enum LongScaleUnit {
  FRAME = 'f',
  SECOND = 's',
  MINUTE = 'm',
  HOUR = 'h'
}

interface ScaleConfig {
  type: LongScaleUnit // 长刻度单位
  unit: number // 当前长刻度单位的值，比如一个长刻度单位的宽度为 10:00，那么这个值就是 10
  parts: number // 长刻度需要被分为 parts 个短刻度
  scaleWidth: number // 短刻度的宽度，单位为 px
}

type EasingFunction = (x: number) => number

/**
 * 时间刻度渲染配置
 */
interface TimelineRenderConfig {
  ratio?: number
  longScaleMinWidth?: number // 至少为多少像素时显示长刻度（长刻度之间的间隔）
  separateParts?: number // 每个长刻度被分割为多少部分
  maxFrameWidth?: number // 一帧的最大宽度

  maxCanvasWidth?: number // canvas 的最大宽度
  canvasHeight?: number // 高度
  backgroundColor?: string // 背景颜色

  scaleHeight?: number // 短刻度的高度
  scaleStrokeColor?: string // 短刻度的颜色

  longScaleHeight?: number // 长刻度的高度
  longScaleStrokeColor?: string // 长刻度颜色

  textFont?: string
  textColor?: string
  textTranslateX?: number // 文本相对于长刻度的 x 轴位置
  textTranslateY?: number // 文本相对于顶部的 y 轴位置
}

function normalizeConfig(config: TimelineRenderConfig = {}) {
  const {
    ratio = window.devicePixelRatio,
    longScaleMinWidth = 120,
    separateParts = 10,
    maxFrameWidth = 60,
    maxCanvasWidth = 500, // canvas 的最大宽度
    canvasHeight = 30,
    backgroundColor = 'transparent',
    scaleHeight = 7,
    scaleStrokeColor = '#666',
    longScaleHeight = 13,
    longScaleStrokeColor = '#999',
    textFont,
    textColor = '#999',
    textTranslateX = 4
  } = config

  return {
    ratio,
    longScaleMinWidth,
    separateParts,
    maxFrameWidth,
    maxCanvasWidth,
    canvasHeight,
    backgroundColor,
    scaleHeight,
    scaleStrokeColor,
    longScaleHeight,
    longScaleStrokeColor,
    textFont: textFont ?? `${13 * ratio}px sans-serif`,
    textColor,
    textTranslateX,
    textTranslateY: longScaleHeight + 2
  }
}

export const useTimelineStore = defineStore('timeline', () => {
  // 基础配置
  const config = normalizeConfig()
  // canvas 元素缓存
  const canvasCollection: HTMLCanvasElement[] = []
  let wrapper: HTMLElement
  let oldUsedCount = 0

  // 当前编辑区帧的总宽度
  const maxFrameCount = ref(0)

  // 经过缩放之后的宽度
  const timelineWidth = ref(0)

  // 当前帧的宽度
  const frameWidth = ref(0)

  /**
   * 获取刻度信息
   *
   * @param {number} frameWidth 帧的宽度
   */
  function getScaleConfig(frameWidth: number): ScaleConfig {
    const { longScaleMinWidth, separateParts } = config

    // 帧
    const frameUnits = [2, 5, 10, 15]
    for (const unit of frameUnits) {
      const w = unit * frameWidth
      if (w > longScaleMinWidth) {
        // 2 帧进行 2 等分, 5 帧进行 5 等分, 大于 10 帧进行 10 等分
        const parts = unit < separateParts ? unit : separateParts
        return {
          type: LongScaleUnit.FRAME,
          unit,
          parts,
          scaleWidth: w / parts
        }
      }
    }

    // 秒
    const secondUnits = [1, 2, 5, 10, 20, 30]
    for (const unit of secondUnits) {
      const w = unit * 30 * frameWidth
      if (w > longScaleMinWidth) {
        return {
          type: LongScaleUnit.SECOND,
          unit,
          parts: separateParts,
          scaleWidth: w / separateParts
        }
      }
    }

    // 分钟（每秒 30f，那么 1 分钟就是 1800f）
    const minutesUnits = [1, 2, 5, 10, 20, 30]
    for (const unit of minutesUnits) {
      const w = unit * 1800 * frameWidth
      if (w > longScaleMinWidth) {
        return {
          type: LongScaleUnit.MINUTE,
          unit,
          parts: separateParts,
          scaleWidth: w / separateParts
        }
      }
    }

    // 小时（每秒 30f，那么 1 小时就是 108000f)
    let i = 0
    let w = 0

    do {
      i += 1
      w = i * 108000 * frameWidth
    } while (w < longScaleMinWidth)

    return {
      type: LongScaleUnit.HOUR,
      unit: i,
      parts: separateParts,
      scaleWidth: w / separateParts
    }
  }

  /**
   * 获取长刻度显示的时间文字
   *
   * @param {number} index 序号
   * @param {number} level 长刻度类型值
   * @param {longScaleType} type 类型
   */
  function formatLongScaleTime(index: number, level: number, unit: LongScaleUnit): string {
    if (index === 0) return '00:00'

    if (unit === LongScaleUnit.FRAME) {
      const frames = index * level
      // 如果刚好满足秒数显示条件则进行格式化显示具体时间
      if (frames % 30 === 0) {
        return secondsToTime(frames / 30)
      }
      return `${(index * level) % 30}f`
    }

    if (unit === LongScaleUnit.SECOND) {
      return secondsToTime(index * level)
    }

    if (unit === LongScaleUnit.MINUTE) {
      return minutesToTime(index * level)
    }

    return hoursToTime(index * level)
  }

  /**
   * 缓动函数，计算随 scale 增大而放大的倍数
   *
   * @param {number} minFrameWidth 没有进行任何缩放时 1 帧的宽度
   */
  function initEasingFunction(minFrameWidth: number): EasingFunction {
    const { maxFrameWidth } = config

    // 缩放到最大时需要放大的倍数
    const scale = maxFrameWidth / minFrameWidth

    // 指数函数
    const a = Math.pow(scale, 1 / 100)
    return (x: number) => Math.pow(a, x)
  }

  /**
   * 绘制 canvas
   */
  function renderCanvas(
    ctx: CanvasRenderingContext2D,
    width: number,
    scaleConfig: ScaleConfig,
    options: {
      startLongScaleIndex?: number // 用于获取长刻度显示的时间，记录当前第一个开始的长刻度是第几个
    } = {}
  ) {
    const {
      canvasHeight,
      backgroundColor,
      ratio,
      scaleHeight,
      scaleStrokeColor,
      longScaleHeight,
      longScaleStrokeColor,
      textColor,
      textFont,
      textTranslateX,
      textTranslateY
    } = config
    const { type, unit, scaleWidth, parts } = scaleConfig
    const { startLongScaleIndex = 0 } = options

    // 短刻度个数
    const scaleCount = Math.floor(width / scaleWidth)

    // 设置画布的宽度和高度
    ctx.canvas.width = width
    ctx.canvas.height = canvasHeight

    // 清空画布
    ctx.scale(ratio, ratio)
    ctx.clearRect(0, 0, width, canvasHeight)

    // canvas 背景色
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, width, canvasHeight)

    // 绘制刻度宽度
    ctx.lineWidth = 1

    // 记录长刻度的 x 轴
    const longLongScaleXList: number[] = []

    /**
     * 绘制短刻度 start
     */
    ctx.beginPath()

    ctx.strokeStyle = scaleStrokeColor

    for (let i = 0; i <= scaleCount; i += 1) {
      // prevent canvas 1px line blurry
      const x = Math.round(scaleWidth * i) + 0.5

      // 保存长刻度的 x 轴位置
      if (i % parts === 0) {
        longLongScaleXList.push(x)
        continue
      }

      ctx.moveTo(x, 0)
      ctx.lineTo(x, scaleHeight)
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

    ctx.strokeStyle = longScaleStrokeColor
    ctx.fillStyle = textColor
    ctx.font = textFont

    const l = longLongScaleXList.length
    for (let i = 0; i < l; i += 1) {
      const x = longLongScaleXList[i]
      ctx.moveTo(x, 0)
      ctx.save()
      ctx.translate(x + textTranslateX, textTranslateY)
      const text = formatLongScaleTime(startLongScaleIndex + i, unit, type)
      ctx.fillText(text, 0, 0)
      ctx.restore()
      ctx.lineTo(x, longScaleHeight)
    }
    ctx.stroke()

    // clearRect 不能清除路径，如果不关闭路径，下次绘制就接着上次的路径继续绘制
    ctx.closePath()
    /**
     * 绘制长刻度 end
     */

    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }

  /**
   * 绘制
   *
   * @param {number} rectWidth timeline 容器的宽度
   * @param {number} frameCount 总帧数
   * @param {number} sliderValue 缩放值
   */
  function updateTimeline(rectWidth: number, frameCount: number, sliderValue: number) {
    if (rectWidth === 0) {
      warn('容器宽度不能为 0')
      return
    }

    let maxCanvasWidth = config.maxCanvasWidth

    // 总帧数需要 * 1.5，因为要预留更多空白操作区域
    maxFrameCount.value = Math.round(frameCount * 1.5)

    // 缩放至最小时每帧的宽度
    const minFrameWidth = rectWidth / maxFrameCount.value

    // 初始化缓动函数
    const getScale = initEasingFunction(minFrameWidth)
    // 根据缩放值获取每帧放大的倍数
    const scale = getScale(sliderValue)

    // timeline 的宽度
    timelineWidth.value = rectWidth * scale

    frameWidth.value = minFrameWidth * scale

    // 根据当前缩放等级下的帧的宽度获取刻度信息
    const scaleConfig = getScaleConfig(frameWidth.value)
    const { scaleWidth, parts } = scaleConfig

    // 长刻度的个数
    const longScaleCount = Math.floor(maxCanvasWidth / (scaleWidth * parts))

    // 更新最大 canvas 宽度，刚好画到以长刻度作为结束，主要是为了解决最后一个长刻度的时间文本可能被截断的问题
    maxCanvasWidth = longScaleCount * parts * scaleWidth

    // 需要用到的最大 canvas 个数
    const canvasCount = Math.ceil(timelineWidth.value / maxCanvasWidth)

    // 被使用的 canvas 个数
    let usedCount = 0

    // 最后一个被使用的 canvas 的宽度
    const lastCanvasWidth = timelineWidth.value % maxCanvasWidth

    const curCanvasCount = canvasCollection.length

    for (let i = 0; i < canvasCount; i += 1) {
      // 如果当前的 canvas 数量不满足则追加新的
      if (i >= curCanvasCount) {
        canvasCollection.push(document.createElement('canvas'))
      }

      const canvas = canvasCollection[i]
      const ctx = canvas.getContext('2d')!

      usedCount = i + 1
      const startLongScaleIndex = longScaleCount * i

      // 如果当前使用的 canvas 个数的总宽度已经满足当前时间刻度的需求，则直接渲染满
      if (maxCanvasWidth * usedCount <= timelineWidth.value) {
        renderCanvas(ctx, maxCanvasWidth, scaleConfig, {
          startLongScaleIndex
        })
      } else {
        renderCanvas(ctx, lastCanvasWidth, scaleConfig, {
          startLongScaleIndex
        })
        break
      }
    }

    // 更新节点数量
    if (usedCount > oldUsedCount) {
      for (let i = oldUsedCount; i < usedCount; i += 1) {
        wrapper.appendChild(canvasCollection[i])
      }
    } else {
      // 从后往前移除
      for (let i = oldUsedCount; i > usedCount; i -= 1) {
        wrapper.removeChild(canvasCollection[i - 1])
      }
    }

    // 记录当前用到的个数
    oldUsedCount = usedCount
  }

  /**
   * 把当前帧数转换为像素
   */
  function frameToPixel(currentFrame: number): number {
    return currentFrame * frameWidth.value
  }

  function frameToPixelWithUnit(currentFrame: number): string {
    return `${frameToPixel(currentFrame)}px`
  }

  /**
   * 把当前帧数转为百分比
   */
  function frameToPercent(currentFrame: number): number {
    return (currentFrame / maxFrameCount.value) * 100
  }

  function frameToPercentWithUnit(currentFrame: number): string {
    return `${frameToPercent(currentFrame)}%`
  }

  function init(target: HTMLElement) {
    wrapper = target
  }

  return {
    maxFrameCount,
    frameWidth,
    timelineWidth,
    init,
    updateTimeline,
    frameToPixel,
    frameToPixelWithUnit,
    frameToPercent,
    frameToPercentWithUnit
  }
})
