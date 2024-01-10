import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router"

const routes: RouteRecordRaw[] = [
  // {
  //   name: "Dashboard",
  //   path: "/",
  //   component: () => import("@/pages/Dashboard.vue"),
  // },
  // {
  //   name: "StatusPage",
  //   path: "/status",
  //   component: () => import("@/pages/StatusPage.vue"),
  // },
  // {
  //   name: "NotFound",
  //   path: "*",
  //   component: () => import("@/pages/NotFound.vue"),
  // },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
