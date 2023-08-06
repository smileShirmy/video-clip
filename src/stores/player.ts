import { FPS } from '@/config'
import { trackList } from '@/services/track-list/track-list'
import { defineStore } from 'pinia'
import { ref } from 'vue'

const SPEED = 1000 / FPS
const DEFAULT_ASPECT_RATIO = 16 / 9

export type PlayerStore = Omit<
  ReturnType<typeof usePlayerStore>,
  keyof ReturnType<typeof defineStore>
>

export const usePlayerStore = defineStore('player', () => {
  const resizing = ref(false)

  const currentFrame = ref(0)

  const aspectRatio = ref(DEFAULT_ASPECT_RATIO)

  const playing = ref(false)

  const sceneWidth = ref(0)

  const sceneHeight = ref(0)

  let timer: number

  function pause() {
    playing.value = false
    window.clearTimeout(timer)
  }

  function play() {
    if (currentFrame.value >= trackList.maxFrame) {
      currentFrame.value = trackList.maxFrame
      pause()
      return
    }
    window.clearTimeout(timer)

    playing.value = true

    timer = window.setTimeout(() => {
      currentFrame.value += 1

      play()
    }, SPEED)
  }

  return {
    sceneWidth,
    sceneHeight,
    resizing,
    aspectRatio,
    currentFrame,
    play,
    pause,
    playing
  }
})
