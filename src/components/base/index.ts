import type { App } from 'vue'
import AppLoading from './app-loading/AppLoading.vue'
import AppPopper from './app-popper/AppPopper.vue'

const baseComponent = {
  install(app: App) {
    app.component(AppLoading.name, AppLoading)
    app.component(AppPopper.name, AppPopper)
  }
}

export default baseComponent
