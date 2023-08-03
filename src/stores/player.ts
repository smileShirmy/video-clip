import { PER_SECOND_FRAMES } from '@/config'
import { trackList } from '@/services/track-list/track-list'
import { defineStore } from 'pinia'
import { ref } from 'vue'

const SPEED = 1000 / PER_SECOND_FRAMES

export const usePlayerStore = defineStore('player', () => {
  const resizing = ref(false)

  const currentFrame = ref(0)

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
    currentFrame,
    play,
    pause,
    playing
  }
})
