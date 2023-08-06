<script setup lang="ts">
import { ref } from 'vue'

const canvasRef = ref<HTMLCanvasElement | null>(null)
</script>

<template>
  <canvas ref="CanvasRef"></canvas>
</template>
