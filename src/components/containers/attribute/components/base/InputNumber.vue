<script setup lang="ts">
import { isNumber } from '@/services/helpers/general'
import { computed } from 'vue'
import IconExpandLess from '@/components/icons/IconExpandLess.vue'
import IconExpandMore from '@/components/icons/IconExpandMore.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: number
    min?: number
    max?: number
    step?: number
    unit?: string
  }>(),
  {
    modelValue: 0,
    min: 0,
    max: 100,
    step: 1
  }
)

const emit = defineEmits({
  ['update:modelValue']: (val: number) => isNumber(val),
  change: (val: number, oldVal: number) => isNumber(val) && isNumber(oldVal) && val !== oldVal
})

function setModelValue(val: number) {
  if (val > props.max) {
    val = props.max
  }
  if (val < props.min) {
    val = props.min
  }

  emit('update:modelValue', val)
  emit('change', Math.round(val), props.modelValue)
}

function onBlur(event: Event) {
  const { value } = event.target as HTMLInputElement

  const val = props.unit ? Number(value.replace(props.unit, '')) : Number(value)

  setModelValue(val)
}

function plus() {
  if (props.modelValue < props.max) {
    setModelValue(props.modelValue + props.step)
  }
}

function minus() {
  if (props.modelValue > props.min) {
    setModelValue(props.modelValue - props.step)
  }
}

const inputValue = computed(() => {
  const val = props.modelValue
  return props.unit ? `${val}${props.unit}` : val
})
</script>

<template>
  <div class="input-number">
    <div class="input-wrapper">
      <div v-if="$slots.prefix" class="prefix">
        <slot name="prefix"></slot>
      </div>
      <input class="input-inner" :value="inputValue" @blur.stop="onBlur" type="text" />
    </div>
    <div class="handler">
      <div class="handler-arrow arrow-up" @click.stop="plus">
        <IconExpandLess class="icon-arrow" />
      </div>
      <div class="handler-arrow arrow-down" @click.stop="minus">
        <IconExpandMore class="icon-arrow" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.input-number {
  display: flex;
  justify-content: flex-start;
  flex-wrap: nowrap;
  user-select: none;
  font-size: var(--app-font-size-small);
  color: var(--app-text-color-dark);

  .input-wrapper {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    box-sizing: border-box;
    height: 20px;
    padding: 0 10px;
    border-radius: 4px;
    background-color: var(--app-bg-color-lighter);
    border: 1px solid transparent;

    .prefix {
      margin-right: 8px;
    }

    &:hover {
      border-color: var(--app-bg-color-extra-lighter);
    }

    .input-inner {
      width: 40px;
      height: 100%;
      outline: none;
      color: var(--app-text-color-regular);
      text-align: center;
      background-color: transparent;
    }
  }

  .handler {
    margin-left: 4px;

    .handler-arrow {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 16px;
      height: 10px;
      background-color: var(--app-bg-color-lighter);
      cursor: pointer;

      &:hover {
        background-color: var(--app-bg-color-extra-lighter);
      }

      .icon-arrow {
        width: 12px;
        height: 12px;
        fill: var(--app-text-color-primary);
      }
    }

    .arrow-up {
      border-radius: 4px 4px 0 0;
    }

    .arrow-down {
      border-radius: 0 0 4px 4px;
    }
  }
}
</style>
