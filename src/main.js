import { createApp } from "vue"
import { createPinia } from "pinia"
import App from "./App.vue"
import router from "./router"
import "./style.css"

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Global error handler
app.config.errorHandler = (error, instance, info) => {
  console.error("Global error:", error)
  console.error("Component instance:", instance)
  console.error("Error info:", info)
}

// Global warning handler
app.config.warnHandler = (msg, instance, trace) => {
  console.warn("Global warning:", msg)
  console.warn("Component instance:", instance)
  console.warn("Trace:", trace)
}

app.mount("#app")
