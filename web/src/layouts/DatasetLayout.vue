<template>
  <div
    v-if="isNil(dataset) || isLoading"
    class="d-flex justify-center"
  >
    <v-progress-circular
      indeterminate
      color="yg-blue"
    />
  </div>
  <v-container
    v-else
    class="px-0 px-md-4"
  >
    <h2 class="mb-3">
      {{ dataset.name }}
    </h2>

    <v-tabs>
      <component
        :is="tabComponent"
        v-for="tabComponent in availableTabs"
        :key="tabComponent.name"
        :slug="slug"
      />
    </v-tabs>

    <router-view></router-view>
  </v-container>
</template>

<script lang="ts" setup>
import { computed, toRefs, defineAsyncComponent } from "vue"
import { isNil } from "lodash"

import useCurrentUser, { RoleTypes } from "@/use/use-current-user"
import useDataset from "@/use/use-dataset"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset, isLoading } = useDataset(slug)

const { currentUser } = useCurrentUser()

const DescriptionTab = defineAsyncComponent(
  () => import("@/layouts/dataset-layout/DescriptionTab.vue")
)
const FieldsTab = defineAsyncComponent(() => import("@/layouts/dataset-layout/FieldsTab.vue"))
// TODO: access tab only has manage view, which is a bit confusing
const AccessTab = defineAsyncComponent(() => import("@/layouts/dataset-layout/AccessTab.vue"))

type TabComponents = typeof DescriptionTab | typeof FieldsTab | typeof AccessTab

const TAB_IMPORTS: {
  [key in RoleTypes]: TabComponents[]
} = {
  [RoleTypes.DATA_OWNER]: [DescriptionTab, FieldsTab, AccessTab],
  [RoleTypes.SYSTEM_ADMIN]: [DescriptionTab, FieldsTab, AccessTab],
  [RoleTypes.BUSINESS_ANALYST]: [DescriptionTab, FieldsTab, AccessTab],
  [RoleTypes.USER]: [DescriptionTab, FieldsTab],
}

const availableTabs = computed<Set<TabComponents>>(() => {
  const tabs = new Set<TabComponents>()

  currentUser.value?.roleTypes.forEach((role) => {
    const roleTabs = TAB_IMPORTS[role]
    roleTabs.forEach((tab) => tabs.add(tab))
  })

  return tabs
})
</script>
