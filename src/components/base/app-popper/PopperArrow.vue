<template>
  <div id="arrow" data-popper-arrow></div>
</template>

<style scoped>
#arrow,
#arrow::before {
  position: absolute;
  width: 9px;
  height: 9px;
  box-sizing: border-box;
  background: var(--app-bg-color-darker);
}

#arrow {
  visibility: hidden;
}

#arrow::before {
  visibility: visible;
  content: '';
  transform: rotate(45deg);
}

/* Top arrow */
.popper[data-popper-placement^='top'] > #arrow {
  bottom: -5px;
}

.popper[data-popper-placement^='top'] > #arrow::before {
  border-right: 1px solid var(--app-bg-color-lighter);
  border-bottom: 1px solid var(--app-bg-color-lighter);
}

/* Bottom arrow */
.popper[data-popper-placement^='bottom'] > #arrow {
  top: -5px;
}

.popper[data-popper-placement^='bottom'] > #arrow::before {
  border-left: 1px solid var(--app-bg-color-lighter);
  border-top: 1px solid var(--app-bg-color-lighter);
}

/* Left arrow */
.popper[data-popper-placement^='left'] > #arrow {
  right: -5px;
}

.popper[data-popper-placement^='left'] > #arrow::before {
  border-right: 1px solid var(--app-bg-color-lighter);
  border-top: 1px solid var(--app-bg-color-lighter);
}

/* Right arrow */
.popper[data-popper-placement^='right'] > #arrow {
  left: -5px;
}
</style>
