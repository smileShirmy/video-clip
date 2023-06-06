<script setup lang="ts">
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <div>
    <button @click="toggleDark()">toggleDark</button>
  </div>
</template>