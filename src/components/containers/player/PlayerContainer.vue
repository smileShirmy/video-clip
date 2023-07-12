<script setup lang="ts">
import { ref } from 'vue'

const playerContainer = ref<HTMLElement>()

defineExpose({
  playerContainer
})
</script>

<template>
  <div class="player-container app-width-transition" ref="playerContainer">PlayerContainer</div>
</template>

<style scoped lang="scss">
.player-container {
  width: 67%;
  background-color: var(--app-bg-color-dark);
}
</style>
