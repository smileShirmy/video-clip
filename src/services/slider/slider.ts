import { FRAME_STEP } from '@/config'
import { nextTick } from 'vue'
import { isFunction } from '../helpers/general'

interface SliderOptions {
  change: (modelValue: number, currentPosition: string) => void
  dragend?: () => void
}

export interface SliderDownOptions {
  min: number
  max: number
  sliderSize: number // slider 的宽度
  value: number
}

export class Slider {
  private startPosition = 0
  private newPosition = 0
  private startX = 0
  private currentX = 0
  private sliderSize = 1
  private dragging = false
  private isClick = false

  private options: SliderOptions

  private step = FRAME_STEP

  private min = 0
  private max = 0
  private modelValue = 0

  get currentPosition() {
    return `${((this.modelValue - this.min) / (this.max - this.min)) * 100}%`
  }

  constructor(options: SliderOptions) {
    this.options = options
  }

  // private resetSliderSize() {
  // this.sliderSize = sliderSize
  // }

  private getClientX(event: MouseEvent | TouchEvent) {
    if (event instanceof TouchEvent) {
      return event.touches[0].clientX
    }
    return event.clientX
  }

  private onDragStart(event: MouseEvent | TouchEvent) {
    this.dragging = true
    this.isClick = true
    const clientX = this.getClientX(event)
    this.startX = clientX
    this.startPosition = parseFloat(this.currentPosition)
    this.newPosition = this.startPosition
  }

  onDragging = (event: MouseEvent | TouchEvent) => {
    if (this.dragging) {
      this.isClick = false
      // this.resetSliderSize()
      let diff = 0
      const clientX = this.getClientX(event)
      this.currentX = clientX
      diff = ((this.currentX - this.startX) / this.sliderSize) * 100
      this.newPosition = this.startPosition + diff
      this.setPosition(this.newPosition)
    }
  }

  private setPosition(newPosition: number) {
    if (newPosition === null || isNaN(newPosition)) return
    if (newPosition < 0) {
      newPosition = 0
    } else if (newPosition > 100) {
      newPosition = 100
    }
    const lengthPerStep = 100 / ((this.max - this.min) / this.step)
    const steps = Math.round(newPosition / lengthPerStep)
    let value = steps * lengthPerStep * (this.max - this.min) * 0.01 + this.min
    value = parseFloat(value.toFixed(0))
    if (value !== this.modelValue) {
      this.modelValue = value
      this.emitChange()
    }
  }

  onDragEnd = () => {
    /*
     * 防止在 mouseup 后立即触发 click，导致滑块有几率产生一小段位移
     * 不使用 preventDefault 是因为 mouseup 和 click 没有注册在同一个 DOM 上
     */
    setTimeout(() => {
      this.dragging = false
      if (!this.isClick) {
        this.setPosition(this.newPosition)
      }
      this.emitChange()
      if (isFunction(this.options.dragend)) {
        this.options.dragend()
      }
    }, 0)

    window.removeEventListener('mousemove', this.onDragging)
    window.removeEventListener('touchmove', this.onDragging)
    window.removeEventListener('mouseup', this.onDragEnd)
    window.removeEventListener('touchend', this.onDragEnd)
    window.removeEventListener('contextmenu', this.onDragEnd)
  }

  private setDownOptions(options: SliderDownOptions) {
    this.min = options.min
    this.max = options.max
    this.sliderSize = options.sliderSize
    this.modelValue = options.value
  }

  async emitChange() {
    await nextTick()
    this.options.change(this.modelValue, this.currentPosition)
  }

  /**
   * 实际情况不同 min、max、sliderSize 等也不同，因此在按下时才传入
   */
  onDown(event: MouseEvent | TouchEvent, options: SliderDownOptions) {
    this.setDownOptions(options)

    event.preventDefault()
    this.onDragStart(event)
    window.addEventListener('mousemove', this.onDragging)
    window.addEventListener('touchmove', this.onDragging)
    window.addEventListener('mouseup', this.onDragEnd)
    window.addEventListener('touchend', this.onDragEnd)
    window.addEventListener('contextmenu', this.onDragEnd)
  }

  onSliderClick(event: MouseEvent, options: SliderDownOptions, element?: HTMLElement) {
    this.setDownOptions(options)

    if (!element || this.dragging) return
    const sliderOffsetLeft = element.getBoundingClientRect().left
    this.setPosition(((event.clientX - sliderOffsetLeft) / this.sliderSize) * 100)
    this.emitChange()
  }
}
