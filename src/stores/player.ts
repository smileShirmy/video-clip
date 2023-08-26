import { FPS } from '@/config'
import { Events, emitter } from '@/services/mitt/emitter'
import type { PlayerTrackItem } from '@/services/track-item'
import { trackList } from '@/services/track-list/track-list'
import { defineStore } from 'pinia'
import { ref, computed, shallowReactive, watch, type ShallowReactive } from 'vue'

const SPEED = 1000 / FPS
const DEFAULT_ASPECT_RATIO = 16 / 9

export type PlayerStore = Omit<
  ReturnType<typeof usePlayerStore>,
  keyof ReturnType<typeof defineStore>
>

export const usePlayerStore = defineStore('player', () => {
  const playerItems: ShallowReactive<PlayerTrackItem[]> = shallowReactive<PlayerTrackItem[]>([])

  const playerSelectedItem = computed(() => {
    return playerItems.find((item) => item.id === trackList.selectedId.value)
  })

  const resizing = ref(false)

  const currentFrame = ref(0)

  const aspectRatio = ref(DEFAULT_ASPECT_RATIO)

  const playing = ref(false)

  const sceneWidth = ref(0)

  const sceneHeight = ref(0)

  let timer: number

  function updatePlayerItems() {
    const items = trackList.getCurrentFramePlayItems(currentFrame.value)
    playerItems.splice(0, playerItems.length, ...items)
    emitter.emit(Events.UPDATE_PLAYER)
  }

  emitter.on(Events.UPDATE_PLAYER_ITEMS, updatePlayerItems)

  watch([currentFrame], updatePlayerItems, { immediate: true })

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
    playerItems,
    playerSelectedItem,
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
