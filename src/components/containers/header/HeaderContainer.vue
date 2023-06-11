<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <header class="header-container">
    <button @click="toggleDark()">toggleDark</button>
  </header>
</template>

<style lang="scss" scoped>
.header-container {
  width: 100%;
  height: 48px;
  background-color: var(--app-bg-color-darker);
}
</style>
