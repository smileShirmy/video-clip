import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  const resizing = ref(false)

  const currentFrame = ref(0)

  return {
    resizing,
    currentFrame
  }
})
