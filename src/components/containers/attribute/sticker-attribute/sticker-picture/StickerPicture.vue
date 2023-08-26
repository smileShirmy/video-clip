<script setup lang="ts">
import { useTrackStore } from '@/stores/track'
import AttributeSlider from '../../components/base/AttributeSlider.vue'
import InputNumber from '../../components/base/InputNumber.vue'
import AttributeItem from '../../components/layout/AttributeItem.vue'
import type { StickerTrackItem } from '@/services/track-item/sticker-track-item'
import { computed } from 'vue'
import { PlayerAttributeChangeAction } from '@/services/steps-manager/player-attribute-action'

defineOptions({
  name: 'StickerPicture'
})

const trackStore = useTrackStore()
const trackItem = computed(() => trackStore.selectedTrackItem as StickerTrackItem)

const opacity = computed({
  get() {
    return trackItem.value.attribute.opacity * 100
  },
  set(opacity) {
    trackItem.value.attribute.opacity = opacity / 100
  }
})

function onOpacityChange(newVal: number, oldVal: number) {
  new PlayerAttributeChangeAction(trackItem.value.id, {
    opacity: oldVal / 100
  }).end({
    opacity: newVal / 100
  })
}

const scale = computed({
  get() {
    return trackItem.value.attribute.scale * 100
  },
  set(scale) {
    trackItem.value.attribute.scale = scale / 100
  }
})

function onScaleChange(newVal: number, oldVal: number) {
  new PlayerAttributeChangeAction(trackItem.value.id, {
    scale: oldVal / 100
  }).end({
    scale: newVal / 100
  })
}

const rotate = computed({
  get() {
    return trackItem.value.attribute.rotate
  },
  set(rotate) {
    trackItem.value.attribute.rotate = rotate
  }
})

function onRotateChange(newVal: number, oldVal: number) {
  new PlayerAttributeChangeAction(trackItem.value.id, {
    rotate: oldVal
  }).end({
    rotate: newVal
  })
}

const translateX = computed({
  get() {
    return trackItem.value.attribute.leftRatio * 100
  },
  set(x) {
    trackItem.value.attribute.leftRatio = x / 100
  }
})

function onTranslateXChange(newVal: number, oldVal: number) {
  new PlayerAttributeChangeAction(trackItem.value.id, {
    leftRatio: oldVal / 100
  }).end({
    leftRatio: newVal / 100
  })
}

const translateY = computed({
  get() {
    return trackItem.value.attribute.topRatio * 100
  },
  set(y) {
    trackItem.value.attribute.topRatio = y / 100
  }
})

function onTranslateYChange(newVal: number, oldVal: number) {
  new PlayerAttributeChangeAction(trackItem.value.id, {
    topRatio: oldVal / 100
  }).end({
    topRatio: newVal / 100
  })
}
</script>

<template>
  <AttributeItem label="不透明度">
    <AttributeSlider v-model="opacity" @change="onOpacityChange" />
    <template #other>
      <InputNumber v-model="opacity" unit="%" @change="onOpacityChange" />
    </template>
  </AttributeItem>
  <AttributeItem label="缩放">
    <AttributeSlider :max="500" v-model="scale" @change="onScaleChange" />
    <template #other>
      <InputNumber :max="500" v-model="scale" unit="%" @change="onScaleChange" />
    </template>
  </AttributeItem>
  <AttributeItem label="坐标">
    <div class="s-coordinate">
      <InputNumber
        :min="-Infinity"
        :max="Infinity"
        v-model="translateX"
        @change="onTranslateXChange"
      >
        <template #prefix>X</template>
      </InputNumber>
      <span class="s-attribute-item-line"></span>
      <InputNumber
        :min="-Infinity"
        :max="Infinity"
        v-model="translateY"
        @change="onTranslateYChange"
      >
        <template #prefix>Y</template>
      </InputNumber>
    </div>
  </AttributeItem>
  <AttributeItem label="旋转">
    <AttributeSlider :max="360" v-model="rotate" @change="onRotateChange" />
    <template #other>
      <InputNumber :max="360" v-model="rotate" unit="°" @change="onRotateChange" />
    </template>
  </AttributeItem>
</template>

<style lang="scss" scoped>
@use '../../assets/scss/shared.scss';
</style>
