<script setup lang="ts">
const props = defineProps({
  name: {
    required: true,
    type: String,
  }
})
</script>

<template>
  <div class="video-item-container">
    <div class="video-cover-wrapper">
      <img src="">
    </div>
    <h5 class="video-name">{{ props.name }}</h5>
  </div>
</template>

<style scoped lang="scss">
.video-item-container {
  .video-cover-wrapper {
    width: 116px;
    height: 78px;
    background-color: var(--app-back-color);
  }

  .video-name {
    font-size: 12px;
  }
}
</style>