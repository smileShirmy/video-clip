import type { App } from 'vue'
import AppLoading from './app-loading/AppLoading.vue'

const baseComponent = {
  install(app: App) {
    app.component(AppLoading.name, AppLoading)
  }
}

export default baseComponent
