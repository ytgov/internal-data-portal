import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router"
import { authGuard } from "@auth0/auth0-vue"

import { parseQuery, stringifyQuery } from "@/api/base-api"

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/layouts/BaseLayout.vue"),
    children: [
      {
        path: "",
        redirect: "dashboard",
      },
      {
        name: "DashboardPage",
        path: "dashboard",
        component: () => import("@/pages/DashboardPage.vue"),
      },
      {
        name: "DatasetsPage",
        path: "datasets",
        component: () => import("@/pages/DatasetsPage.vue"),
      },
      {
        name: "DatasetNewPage",
        path: "datasets/new",
        component: () => import("@/pages/DatasetNewPage.vue"),
      },
      {
        path: "datasets/:slug",
        component: () => import("@/layouts/DatasetLayout.vue"),
        props: true,
        children: [
          {
            name: "DatasetPage",
            path: "",
            redirect: { name: "DatasetDescriptionReadPage" },
          },
          {
            name: "DatasetDescriptionReadPage",
            path: "description/read",
            component: () => import("@/pages/DatasetDescriptionReadPage.vue"),
            props: true,
          },
          {
            path: "description/manage",
            name: "DatasetDescriptionManagePage",
            component: () => import("@/pages/DatasetDescriptionManagePage.vue"),
            props: true,
          },
          {
            name: "DatasetFieldsReadPage",
            path: "fields/read",
            component: () => import("@/pages/DatasetFieldsReadPage.vue"),
            props: true,
          },
          {
            name: "DatasetFieldsManagePage",
            path: "fields/manage",
            component: () => import("@/pages/DatasetFieldsManagePage.vue"),
            props: true,
          },
          {
            name: "DatasetAccessManagePage",
            path: "access/manage",
            component: () => import("@/pages/DatasetAccessManagePage.vue"),
            props: true,
          },
          {
            name: "DatasetVisualizeReadPage",
            path: "visualize/read",
            component: () => import("@/pages/DatasetVisualizeReadPage.vue"),
            props: true,
          },
          {
            name: "DatasetVisualizeManagePage",
            path: "visualize/manage",
            component: () => import("@/pages/DatasetVisualizeManagePage.vue"),
            props: true,
          },
        ],
      },
      // TODO: Make this page a tab in the DatasetLayout, after I make that pattern more flexible
      {
        path: "datasets/:slug/api/manage",
        name: "DatasetApiManagePage",
        component: () => import("@/pages/DatasetApiManagePage.vue"),
        props: true,
      },
      {
        path: "profile",
        name: "ProfilePage",
        component: () => import("@/pages/ProfilePage.vue"),
      },
      {
        path: "profile/edit",
        name: "ProfileEditPage",
        component: () => import("@/pages/ProfileEditPage.vue"),
      },
      {
        path: "users",
        name: "UsersPage",
        component: () => import("@/pages/UsersPage.vue"),
      }
    ],
  },
  {
    name: "SignInPage",
    path: "/sign-in",
    component: () => import("@/pages/SignInPage.vue"),
    meta: { requiresAuth: false },
  },
  {
    name: "StatusPage",
    path: "/status",
    component: () => import("@/pages/StatusPage.vue"),
    meta: { requiresAuth: false },
  },
  {
    name: "UnauthorizedPage",
    path: "/errors/unauthorized",
    component: () => import("@/pages/UnauthorizedPage.vue"),
  },
  {
    name: "NotFoundPage",
    path: "/:pathMatch(.*)*",
    component: () => import("@/pages/NotFoundPage.vue"),
  },
]

const router = createRouter({
  history: createWebHistory(),
  // @ts-expect-error - Ignore vue-router query format as Qs format _does_ work
  parseQuery,
  stringifyQuery,
  routes,
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth === false) return true
  // TODO: consider whether I should redirect to /sign-in instead of the auth0 login page?
  const isAuthenticated = await authGuard(to)
  if (isAuthenticated) return true

  // TODO: consider loading user in route guard?
  // check if current user exists
  // attempt to load current user, unless it's already been loaded?
  // if current user does not exist, attempt to create a new user
  // if current user still does exist, throw some kind of error?
  // if meta.requiresRoleAdmin (or whatever) does not match or exceed current user role
  // return false

  return false
})

export default router
