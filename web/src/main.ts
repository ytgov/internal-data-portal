import { createApp } from "vue"
import { createPinia } from "pinia" // TODO: move to plugins?

// Plugins
import vuetify from "@/plugins/vuetify-plugin"
import auth0 from "@/plugins/auth0-plugin"

import router from "@/router"

import App from "@/App.vue"

const pinia = createPinia()
const app = createApp(App)
app.use(pinia).use(router).use(vuetify).use(auth0)

app.mount("#app")
