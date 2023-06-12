import { hoursToTime, minutesToTime, secondsToTime } from '@/services/helpers/time'

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
interface TimelineRenderOptions {
  ratio?: number
  longScaleMinWidth?: number // 至少为多少像素时显示长刻度
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

function normalizeOptions(options: TimelineRenderOptions) {
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
  } = options

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

export class TimelineRender {
  private options: ReturnType<typeof normalizeOptions>

  private canvasCollection: HTMLCanvasElement[] = []

  constructor(options: TimelineRenderOptions = {}) {
    this.options = normalizeOptions(options)
  }

  /**
   * 获取刻度信息
   *
   * @param {number} frameWidth 帧的宽度
   */
  private getScaleConfig(frameWidth: number): ScaleConfig {
    const { longScaleMinWidth, separateParts } = this.options

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
  private formatLongScaleTime(index: number, level: number, unit: LongScaleUnit): string {
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
  private initEasingFunction(minFrameWidth: number): EasingFunction {
    const { maxFrameWidth } = this.options

    // 缩放到最大时需要放大的倍数
    const scale = maxFrameWidth / minFrameWidth

    // 指数函数
    const a = Math.pow(scale, 1 / 100)
    return (x: number) => Math.pow(a, x)
  }

  /**
   * 绘制 canvas
   */
  render(
    ctx: CanvasRenderingContext2D,
    width: number,
    scaleConfig: ScaleConfig,
    options: {
      startScaleX?: number
      startLongScaleX?: number
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
    } = this.options

    const { startScaleX = 0, startLongScaleX = 0 } = options

    const { type, unit, scaleWidth, parts } = scaleConfig

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

    const count = Math.floor(width / scaleWidth)
    for (let i = 0; i <= count; i += 1) {
      // TODO: 优化 x 的取值
      // prevent canvas 1px line blurry
      const x = startScaleX + Math.floor(scaleWidth * i) + 0.5

      // 保存长刻度的 x 轴位置
      if (i % parts === 0) {
        longLongScaleXList.push(x)
      }

      console.log(x)
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
      const x = startLongScaleX + longLongScaleXList[i]
      ctx.moveTo(x, 0)
      ctx.save()
      ctx.translate(x + textTranslateX, textTranslateY)
      const text = this.formatLongScaleTime(i, unit, type)
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

    // 计算最后的位置信息，为了下一个 canvas 能够继续画

    // 最后一个刻度 x 已经绘制的长度
    const scaleX = width % scaleWidth
    // 最后一个长刻度已经绘制的长度
    const longScaleX = width - longLongScaleXList[longLongScaleXList.length - 1]
    // 下一个 canvas 开始绘制的偏移值
    const nextScaleXStart = scaleWidth - scaleX
    // 下一个 canvas 第一个长刻度剩余需要绘制的短刻度
    const nextLongScaleStartX = scaleWidth * 10 - longScaleX

    return {
      nextScaleXStart,
      nextLongScaleStartX
    }
  }

  /**
   *
   * @param initRectWidth
   * @param frameCount
   * @param scale
   */
  init(initRectWidth = 500, frameCount = 400, sliderValue = 10) {
    const { maxFrameWidth, canvasHeight, maxCanvasWidth } = this.options

    // 总帧数需要 *1.5，预留更多空白操作区域
    const maxFrameCount = frameCount * 1.5

    // 缩放至最下时每帧的宽度
    const minFrameWidth = initRectWidth / maxFrameCount

    // 初始化缓动函数
    const func = this.initEasingFunction(minFrameWidth)
    // 每帧放大的倍数
    const scale = func(sliderValue)

    // timeline 的宽度
    const timelineWidth = initRectWidth * scale

    // 最大宽度
    const maxWidth = maxFrameWidth * maxFrameCount

    // 创建可供绘制的最多 canvas 个数
    const canvasCount = Math.ceil(maxWidth / maxCanvasWidth)
    this.canvasCollection = Array.from({ length: canvasCount }, () =>
      document.createElement('canvas')
    )

    // 根据当前缩放等级下的帧的宽度获取刻度信息
    const scaleConfig = this.getScaleConfig(minFrameWidth * scale)

    // 最后一个被使用的 canvas 的宽度
    const lastCanvasWidth = timelineWidth % maxCanvasWidth

    // 被使用的 canvas 个数
    let usedCount = 0

    // TODO: 文本可能会刚好被截断的情况也需要处理
    let startScaleX = 0
    let startLongScaleX = 0

    for (let i = 0; i < canvasCount; i += 1) {
      const canvas = this.canvasCollection[i]
      const ctx = canvas.getContext('2d')!
      ctx.canvas.height = canvasHeight

      // 如果当前使用的 canvas 总宽度已经满足当前时间刻度的需求
      if (maxCanvasWidth * (i + 1) <= timelineWidth) {
        const { nextScaleXStart, nextLongScaleStartX } = this.render(
          ctx,
          maxCanvasWidth,
          scaleConfig,
          {
            startScaleX,
            startLongScaleX
          }
        )
        startScaleX = nextScaleXStart
        startLongScaleX = nextLongScaleStartX
      }
      // 如果不满足
      else {
        usedCount = i + 1

        this.render(ctx, lastCanvasWidth, scaleConfig, {
          startScaleX,
          startLongScaleX
        })
        break
      }
    }

    console.log(usedCount)

    const demo = document.getElementById('demo')
    if (demo) {
      for (let i = 0; i < usedCount; i += 1) {
        demo.appendChild(this.canvasCollection[i])
      }
    }
  }
}
