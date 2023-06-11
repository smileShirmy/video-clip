<script setup lang="ts">
import TimelineRuler from '../timeline-ruler/TimelineRuler.vue'

</script>

<template>
  <div class="track-controller">
    <TimelineRuler />
  </div>
</template>

<style scoped lang="scss">
.track-controller {
  width: 100%;
  overflow: auto;
}
</style>
