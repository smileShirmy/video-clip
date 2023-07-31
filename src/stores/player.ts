import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  const resizing = ref(false)

  return {
    resizing
  }
})
