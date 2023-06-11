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
  ratio?: number // 默认为 window.devicePixelRatio
  longScaleMinWidth?: number // 至少为多少像素时显示长刻度，默认为 120
  separateParts?: number // 每个长刻度被分割为多少部分，默认为 10
  maxFrameWidth?: number // 一帧的最大宽度，默认为 60
  backgroundColor?: number // 背景颜色，默认为 transparent
}

function normalizeOptions(options: TimelineRenderOptions) {
  const {
    ratio = window.devicePixelRatio,
    longScaleMinWidth = 120,
    separateParts = 10,
    maxFrameWidth = 60,
    backgroundColor = 'transparent'
  } = options

  return {
    ratio,
    longScaleMinWidth,
    separateParts,
    maxFrameWidth,
    backgroundColor
  }
}

export class TimelineRender {
  private options: ReturnType<typeof normalizeOptions>

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
  private formatIntervalTime(index: number, level: number, unit: LongScaleUnit): string {
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

  // private drawTimelineRuler(scaleLevel: number, frameCount: number) {
  //   if (!timelineCanvasRef.value) return

  //   const ctx = timelineCanvasRef.value.getContext('2d')

  //   if (!ctx) return

  //   // 计算放大倍数及放大后的宽度
  //   const minFrameWidth = timelineRect.width / frameCount
  //   const func = initEasingFunction(minFrameWidth)
  //   const scale = func(scaleLevel)
  //   const width = timelineRect.width * scale

  //   // 设置 canvas 大小，canvas 默认大小为 300 * 150，因此需要设置为和容器大小相同
  //   ctx.canvas.width = width
  //   ctx.canvas.height = timelineRect.height

  //   timelineRect.width = width

  //   // 清空画布
  //   ctx.scale(RATIO, RATIO)
  //   ctx.clearRect(0, 0, width, timelineRect.height)

  //   // canvas 背景色
  //   ctx.fillStyle = BACKGROUND_COLOR
  //   ctx.fillRect(0, 0, width, timelineRect.height)

  //   // 根据当前缩放等级下的帧宽度获取长刻度信息
  //   const { type, level, intervalWidth, parts } = getIntervalConfig(minFrameWidth * scale)

  //   // 绘制刻度
  //   ctx.lineWidth = 1

  //   // 短刻度的高度
  //   const INTERVAL_HEIGHT = 7
  //   // 长刻度高度
  //   const LONG_INTERVAL_HEIGHT = 13

  //   // 记录长刻度的 x 轴
  //   const longIntervalXList: number[] = []

  //   /**
  //    * 绘制短刻度 start
  //    */
  //   ctx.beginPath()

  //   ctx.strokeStyle = '#666'

  //   const count = Math.floor(width / intervalWidth)
  //   for (let i = 0; i <= count; i += 1) {
  //     // TODO: 优化 x 的取值
  //     // prevent canvas 1px line blurry
  //     const x = Math.floor(intervalWidth * i) + 0.5

  //     // 保存长刻度的 x 轴位置
  //     if (i % parts === 0) {
  //       longIntervalXList.push(x)
  //     }

  //     ctx.moveTo(x, 0)
  //     ctx.lineTo(x, INTERVAL_HEIGHT)
  //   }
  //   ctx.stroke()

  //   ctx.closePath()
  //   /**
  //    * 绘制短刻度 end
  //    */

  //   /**
  //    * 绘制长刻度 start
  //    * 因为长刻度的刻度线颜色和文本颜色跟短刻度不同，因此单独绘制
  //    */
  //   ctx.beginPath()

  //   ctx.strokeStyle = '#999'
  //   ctx.fillStyle = '#999'
  //   ctx.font = `${13 * RATIO}px sans-serif`
  //   ctx.lineWidth = 1
  //   ctx.textBaseline = 'middle'

  //   const l = longIntervalXList.length
  //   for (let i = 0; i < l; i += 1) {
  //     const x = longIntervalXList[i]
  //     ctx.moveTo(x, 0)
  //     ctx.save()
  //     ctx.translate(x + 4, LONG_INTERVAL_HEIGHT + 2)
  //     const text = formatIntervalTime(i, level, type)
  //     ctx.fillText(text, 0, 0)
  //     ctx.restore()
  //     ctx.lineTo(x, LONG_INTERVAL_HEIGHT)
  //   }
  //   ctx.stroke()

  //   // clearRect 不能清除路径，如果不关闭路径，下次绘制就接着上次的路径继续绘制
  //   ctx.closePath()
  //   /**
  //    * 绘制长刻度 end
  //    */

  //   ctx.setTransform(1, 0, 0, 1, 0, 0)
  // }
}
