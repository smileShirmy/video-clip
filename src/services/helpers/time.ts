import { FPS } from '@/config'

/**
 * 时间补 0
 *
 * @param {number} v
 * @returns
 */
function padZero(v: number) {
  return String(v).padStart(2, '0')
}

/**
 * 根据秒转为格式化时间
 *
 * @param {number} seconds
 * @returns
 */
export function secondsToTime(seconds: number) {
  const h = Math.floor((seconds / 60 / 60) % 24)
  const m = Math.floor((seconds / 60) % 60)
  const s = Math.floor(seconds % 60)
  const time = `${padZero(m)}:${padZero(s)}`
  return h > 0 ? `${padZero(h)}:${time}` : time
}

/**
 * 根据分钟转为格式化时间
 *
 * @param {number} minutes
 * @returns
 */
export function minutesToTime(minutes: number) {
  const h = Math.floor((minutes / 60) % 24)
  const m = Math.floor(minutes % 60)
  const time = `${padZero(m)}:00`
  return h > 0 ? `${padZero(h)}:${time}` : time
}

/**
 * 根据小时转为格式化时间
 *
 * @param {number} minutes
 * @returns
 */
export function hoursToTime(hours: number) {
  return `${padZero(hours)}:00:00`
}

/**
 * 根据帧转换为时间
 */
export function frameToTime(frame: number) {
  const seconds = Math.floor(frame / FPS)
  const frames = frame % FPS
  const h = Math.floor((seconds / 60 / 60) % 24)
  const m = Math.floor((seconds / 60) % 60)
  const s = Math.floor(seconds % 60)

  return {
    time: `${padZero(h)}:${padZero(m)}:${padZero(s)}`,
    frame: padZero(frames)
  }
}

/**
 * 根据持续时间转化为帧
 */
export function durationToFrameCount(duration: number): number {
  return Math.ceil(duration / 1000) * FPS
}

/**
 * 帧转换为毫秒
 */
export function frameToMillisecond(frame: number) {
  return Math.floor((frame / FPS) * 1000)
}

/**
 * 帧转换为秒
 */
export function frameToSeconds(frame: number) {
  return Math.floor(frame / FPS)
}

/**
 * 帧转换为秒
 */
export function frameToFixedSeconds(frame: number, fractionDigits = 2) {
  return Number(frameToSeconds(frame).toFixed(fractionDigits))
}
