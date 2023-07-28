<script setup lang="ts">
import { ref } from 'vue'
import Moveable from 'vue3-moveable'

const target = ref()

function onDrag({ transform }: any) {
  target.value!.style.transform = transform
}

function onScale({ drag }: any) {
  target.value!.style.transform = drag.transform
}

function onRotate({ drag }: any) {
  target.value!.style.transform = drag.transform
}
</script>

<template>
  <header class="header"></header>
  <main class="main">
    <aside class="aside"></aside>
    <div class="scene">
      <div class="target" ref="target">Vue Moveable</div>
      <Moveable
        className="moveable"
        v-bind:target="['.target']"
        v-bind:draggable="true"
        v-bind:scalable="true"
        v-bind:rotatable="true"
        @drag="onDrag"
        @scale="onScale"
        @rotate="onRotate"
      />
    </div>
  </main>
</template>

<style lang="scss" scoped>
.header {
  width: 100%;
  height: 100px;
  background-color: #000;
}

.main {
  display: flex;
  justify-content: flex-start;

  .aside {
    flex-shrink: 0;
    display: inline-block;
    width: 100px;
    height: 100%;
  }

  .scene {
    flex-shrink: 0;
    width: 500px;
    height: 500px;
    background-color: #aaa;
  }

  .target {
    display: inline-block;
    background-color: red;
    color: #fff;
    width: 100px;
    height: 100px;
  }
}
</style>
