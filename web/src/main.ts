import { createApp } from "vue"
import { createPinia } from "pinia"
import { router } from "./routes"

// Plugins
import App from "./App.vue"

const pinia = createPinia()
const app = createApp(App)
app
  .use(pinia)
  .use(router)

app.mount("#app")
