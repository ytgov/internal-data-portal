import { createApp } from "vue"
import { createPinia } from "pinia" // TODO: move to plugins?

// Plugins
import vuetify from "@/plugins/vuetify-plugin"
import auth0 from "@/plugins/auth0-plugin"
import vueI18n from "@/plugins/vue-i18n-plugin"

import router from "@/router"

import App from "@/App.vue"

const pinia = createPinia()
const app = createApp(App)
app.use(pinia).use(router).use(vuetify).use(auth0).use(vueI18n)

app.mount("#app")
