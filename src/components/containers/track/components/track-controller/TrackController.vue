<script setup lang="ts">
import { computed } from 'vue'
import type { ComputedRef, CSSProperties } from 'vue'
import { useTrackStore } from '@/stores/track'
import { useTimelineStore } from '@/stores/timeline'
import TimelineRuler from './TimelineRuler.vue'
import VideoItem from '../track-item/VideoItem.vue'
import TextItem from '../track-item/TextItem.vue'
import { TrackItemComponentName } from '@/types'
import { trackList } from '@/services/track-list/track-list'
import { TrackType } from '@/services/track/base-track'
import { usePreviewLine } from './use-preview-line'
import { useSeekLine } from './use-seek-line'
import { draggable } from '@/services/draggable/draggable'

defineOptions({
  components: {
    [TrackItemComponentName.TRACK_ITEM_VIDEO]: VideoItem,
    [TrackItemComponentName.TRACK_ITEM_TEXT]: TextItem
  }
})

const trackStore = useTrackStore()
const timelineStore = useTimelineStore()

const {
  trackListRef,
  trackContentRef,
  trackPlaceholderRef,
  timelineResourceRef,
  verticalLineStyle,
  horizontalLineStyle,
  trackPlaceholderStyle
} = draggable.setup()

const { previewLineStyle, previewLineX } = usePreviewLine(trackContentRef, timelineResourceRef)

useSeekLine(timelineResourceRef, previewLineX)

const trackContentWidthStyle: ComputedRef<CSSProperties> = computed(() => ({
  width: `${timelineStore.timelineWidth}px`
}))
</script>

<template>
  <div
    class="track-controller"
    :class="{
      'overflow-hidden': trackStore.disableScroll
    }"
  >
    <div class="track-menu"></div>
    <!-- position: relative -->
    <div class="track-content" ref="trackContentRef" :style="trackContentWidthStyle">
      <TimelineRuler />
      <div class="timeline-resource" ref="timelineResourceRef" data-clear-selected>
        <ul class="track-list">
          <li
            v-for="(track, trackIndex) in trackList.list"
            ref="trackListRef"
            :key="track.id"
            class="track"
            :data-index="trackIndex"
            :data-type="track.type"
            data-clear-selected
            :style="{ height: `${track.height}px` }"
            :class="{ 'is-main': track.type === TrackType.MAIN }"
          >
            <template v-for="item in track.trackList" :key="item.id">
              <component :is="item.component" :data="item"></component>
            </template>
          </li>
        </ul>

        <div
          v-show="trackStore.showTrackPlaceholder"
          class="track-placeholder"
          ref="trackPlaceholderRef"
          :style="trackPlaceholderStyle"
        ></div>

        <div
          v-show="trackStore.showHorizontalLine"
          class="horizontal-line"
          :style="horizontalLineStyle"
        ></div>
        <div
          v-show="trackStore.showVerticalLine"
          class="vertical-line"
          :style="verticalLineStyle"
        ></div>

        <div
          v-show="trackStore.showPreviewLine"
          :style="previewLineStyle"
          class="preview-line"
        ></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.track-controller {
  display: flex;
  justify-content: flex-start;
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  height: calc(100% - 30px);

  &.overflow-hidden {
    overflow: hidden;
  }

  .track-menu {
    flex-shrink: 0;
    width: 80px;
    height: 100%;
  }

  .track-content {
    position: relative;
    height: 100%;
  }

  .timeline-resource {
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-sizing: border-box;
    height: calc(100% - 30px);
    width: 100%;
    padding: 80px 0;
    overflow-y: auto;
  }

  .track-placeholder {
    box-sizing: border-box;
    position: absolute;
    background-color: rgba(#7086e9, 0.2);
    border: 2px dashed rgba(#7086e9, 0.5);
    border-radius: 4px;
    pointer-events: none;
  }

  .horizontal-line {
    position: absolute;
    top: 0;
    width: 100%;
    height: 1px;
    background-color: #7086e9;
    pointer-events: none;
  }

  .vertical-line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 1px;
    background-color: #7086e9;
    pointer-events: none;
  }

  .preview-line {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 1px;
    pointer-events: none;
  }

  .track-list {
    width: 100%;
    .track {
      position: relative;
      width: 100%;
      height: 60px;
      border-radius: 4px;

      &.is-main {
        background-color: var(--app-color-black);
        height: 60px;
      }

      + .track {
        margin-top: 8px;
      }
    }
  }
}
</style>
./use-seekLine @/services/track/base-line @/services/track-list/track-list
