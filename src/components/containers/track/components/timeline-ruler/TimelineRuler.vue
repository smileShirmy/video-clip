<script setup lang="ts">
import { computed } from 'vue'
import { reactive } from 'vue'
import { ref } from 'vue'
import { TimelineRender } from '../timeline-render'

const timelineRulerRef = ref<HTMLDivElement | null>(null)
const timelineRect = reactive({
  width: 0,
  height: 0
})

const timelineStyle = computed(() => {
  const { width, height } = timelineRect
  return {
    width: `${width}px`,
    height: `${height}px`
  }
})

function initTimelineRuler(w: number, h = 30) {
  timelineRect.width = w
  timelineRect.height = h

  // TODO:
  // new TimelineRender()

  const e = new TimelineRender()
  e.init()
}

defineExpose({
  initTimelineRuler
})
</script>

<template>
  <div class="timeline-ruler" ref="timelineRulerRef" id="demo"></div>
</template>
