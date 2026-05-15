import { createSSRApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import './index.css'
import { ensureH5CallbackBridge } from './utils/h5-bridge'

ensureH5CallbackBridge()

export function createApp() {
  const app = createSSRApp(App)
  const pinia = createPinia()
  
  app.use(pinia)
  
  return {
    app
  }
}
