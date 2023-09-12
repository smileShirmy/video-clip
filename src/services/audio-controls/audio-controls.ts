import { TrackItemName, type AudioInfo } from '@/types'
import { ffManager } from '../ffmpeg/manager'
import { trackList } from '../track-list/track-list'
import { AudioTrackItem } from '../track-item/audio-track-item'
import type { VideoTrackItem } from '../track-item/video-track-item'
import { frameToMillisecond, frameToSeconds, frameToFixedSeconds } from '../helpers/time'
import { emitter, Events } from '../mitt/emitter'
import { useDebounceFn } from '@vueuse/core'

class AudioControls {
  private readonly audio = new Audio()

  constructor() {
    emitter.on(Events.INIT_AUDIO, useDebounceFn(this.initAudio, 1000))
  }

  private initAudio = async () => {
    this.clear()

    const audioAndVideoTrackItems = trackList.list.reduce(
      (pre: Array<AudioTrackItem | VideoTrackItem>, track) => {
        const arr = track.trackItemList.filter(
          (trackItem): trackItem is AudioTrackItem | VideoTrackItem => {
            return (
              (trackItem.component === TrackItemName.TRACK_ITEM_AUDIO ||
                trackItem.component === TrackItemName.TRACK_ITEM_VIDEO) &&
              trackItem.loading.value === false
            )
          }
        )
        return pre.concat(arr)
      },
      []
    )

    if (!audioAndVideoTrackItems.length) {
      return
    }

    const audioInfo = audioAndVideoTrackItems.reduce((pre: AudioInfo[], item) => {
      const { name, format } = item.resource
      const filename = `${name}.${format}`
      const { startFrame, endFrame, minFrame, maxFrame } = item
      // 开始偏移值
      const offsetStart = startFrame - minFrame
      // 结束偏移值
      const offsetEnd = maxFrame - endFrame

      const info: AudioInfo = {
        filename,
        delayMilliseconds: frameToMillisecond(startFrame),
        trim:
          offsetStart > 0 || offsetEnd > 0
            ? {
                startSeconds: frameToFixedSeconds(offsetStart),
                endSeconds: frameToFixedSeconds(endFrame - minFrame)
              }
            : undefined
      }

      return pre.concat(info)
    }, [])

    const { outputPath } = await ffManager.mergeAudio(audioInfo)
    const url = ffManager.readFileUrl(outputPath, 'audio/mp3')

    this.audio.src = url
  }

  play(currentFrame: number) {
    const seconds = frameToSeconds(currentFrame)
    this.audio.currentTime = seconds
    this.audio.play()
  }

  pause() {
    this.audio.pause()
  }

  clear() {
    if (!this.audio.paused) {
      this.audio.pause()
      this.audio.src = ''
    }
  }
}

const audioControls = new AudioControls()

export { audioControls }
