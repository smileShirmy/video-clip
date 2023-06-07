<script lang="ts">
import LocalResource from './components/local-resource/LocalResource.vue'
import TextResource from './components/text-resource/TextResource.vue'

export default {
  components: {
    [ResourceComponentName.LOCAL_RESOURCE]: LocalResource,
    [ResourceComponentName.TEXT_RESOURCE]: TextResource,
  }
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { ResourceComponentName } from './types'
import type { MenuItem } from './types'

const component = ref(LocalResource.name)

const menu: MenuItem[] = [
  {
    componentName: ResourceComponentName.LOCAL_RESOURCE,
    name: '本地素材'
  },
  {
    componentName: ResourceComponentName.TEXT_RESOURCE,
    name: '文本'
  }
]

function selectMenu(componentName: string) {
  component.value = componentName
}
</script>

<template>
  <aside class="resource-container">
    <ul class="menu-list">
      <li class="menu-item" :class="{ active: item.componentName === component }" v-for="item in menu"
        :key="item.componentName" @click="selectMenu(item.componentName)">
        <span>{{ item.name }}</span>
      </li>
    </ul>
    <div class="resource-wrapper">
      <KeepAlive>
        <component :is="component" />
      </KeepAlive>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.resource-container {
  box-sizing: border-box;
  display: flex;
  justify-content: flex-start;
  height: 100%;
  border-right: 1px solid var(--app-background-color);

  .menu-list {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: var(--app-menu-background-color);

    .menu-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 80px;
      height: 60px;
      cursor: pointer;

      &.active {
        background-color: var(--app-resource-background-color);
      }
    }
  }

  .resource-wrapper {
    min-width: 300px;
    height: 100%;
    background-color: var(--app-resource-background-color);
  }
}
</style>
