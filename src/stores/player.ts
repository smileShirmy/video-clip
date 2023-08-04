import { FPS } from '@/config'
import { trackList } from '@/services/track-list/track-list'
import { defineStore } from 'pinia'
import { ref } from 'vue'

const SPEED = 1000 / FPS
const DEFAULT_ASPECT_RATIO = 16 / 9

export const usePlayerStore = defineStore('player', () => {
  const resizing = ref(false)

  const currentFrame = ref(0)

  const aspectRatio = ref(DEFAULT_ASPECT_RATIO)

  const playing = ref(false)

  let timer: number

  function pause() {
    playing.value = false
    window.clearTimeout(timer)
  }

  function play() {
    if (currentFrame.value >= trackList.maxFrame) {
      currentFrame.value = trackList.maxFrame
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
    resizing,
    aspectRatio,
    currentFrame,
    play,
    pause,
    playing
  }
})
