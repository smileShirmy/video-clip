import './assets/scss/index.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './services/ffmpeg/manager'

import App from './App.vue'
import router from './router'
import baseComponent from './components/base'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(baseComponent)

app.mount('#app')
