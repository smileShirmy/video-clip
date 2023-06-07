<script setup lang="ts">
import HeaderContainer from '@/components/containers/header/HeaderContainer.vue'
import TrackContainer from '@/components/containers/track/TrackContainer.vue';
import PlayerContainer from '@/components/containers/player/PlayerContainer.vue';
import ResourceContainer from '@/components/containers/resource/ResourceContainer.vue'
import AttributeContainer from '@/components/containers/attribute/AttributeContainer.vue'

</script>

<template>
  <HeaderContainer />
  <main class="home-main">
    <ResourceContainer />
    <div class="editor-wrapper">
      <div class="player-workplace">
        <PlayerContainer />
        <AttributeContainer />
      </div>
      <TrackContainer />
    </div>
  </main>
</template>

<style scoped lang="scss">
.home-main {
  display: flex;
  height: calc(100% - 48px);

  .editor-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;

    .player-workplace {
      flex: 1;
      display: flex;
      justify-content: flex-start;
    }
  }
}
</style>