import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router"

const routes: RouteRecordRaw[] = [
  {
    name: "SplashPage",
    path: "/",
    component: () => import("@/pages/SplashPage.vue"),
  },
  {
    name: "StatusPage",
    path: "/status",
    component: () => import("@/pages/StatusPage.vue"),
  },
  {
    name: "NotFoundPage",
    path: "/:pathMatch(.*)*",
    component: () => import("@/pages/NotFoundPage.vue"),
  },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
