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
        :is="component"
        v-for="{ component, attributes } in availableTabs"
        :key="component.name"
        :slug="slug"
        v-bind="attributes"
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
import { AccessTypes } from "@/api/access-grants-api"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset, isLoading, policy } = useDataset(slug)

const { currentUser } = useCurrentUser()

const DescriptionTab = defineAsyncComponent(
  () => import("@/layouts/dataset-layout/DescriptionTab.vue")
)
const FieldsTab = defineAsyncComponent(() => import("@/layouts/dataset-layout/FieldsTab.vue"))
// TODO: access tab only has manage view, which is a bit confusing
const AccessTab = defineAsyncComponent(() => import("@/layouts/dataset-layout/AccessTab.vue"))
const VisualizeTab = defineAsyncComponent(() => import("@/layouts/dataset-layout/VisualizeTab.vue"))

type TabComponents = {
  component: typeof DescriptionTab | typeof FieldsTab | typeof AccessTab
  attributes: {
    locked: boolean
  }
}

const canUpdateDataset = computed(() => {
  return policy.value?.update === true
})

// TODO: consider return fields policy in dataset policy
// e.g. policy.value?.fields.show or something
const isReadableByUser = computed(() => {
  if (dataset.value?.currentUserAccessGrant?.accessType === AccessTypes.OPEN_ACCESS) {
    return true
  }

  return !isNil(dataset.value?.currentUserAccessRequest?.approvedAt)
})

const tabImports = computed<{
  [key in RoleTypes]: TabComponents[]
}>(() => ({
  [RoleTypes.DATA_OWNER]: [
    { component: DescriptionTab, attributes: { locked: false } },
    { component: FieldsTab, attributes: { locked: false } },
    { component: AccessTab, attributes: { locked: !canUpdateDataset.value } },
    { component: VisualizeTab, attributes: { locked: !canUpdateDataset.value } },
  ],
  [RoleTypes.SYSTEM_ADMIN]: [
    { component: DescriptionTab, attributes: { locked: false } },
    { component: FieldsTab, attributes: { locked: false } },
    { component: AccessTab, attributes: { locked: false } },
    { component: VisualizeTab, attributes: { locked: false } },
  ],
  [RoleTypes.BUSINESS_ANALYST]: [
    { component: DescriptionTab, attributes: { locked: false } },
    { component: FieldsTab, attributes: { locked: false } },
    { component: AccessTab, attributes: { locked: false } },
    { component: VisualizeTab, attributes: { locked: false } },
  ],
  [RoleTypes.USER]: [
    { component: DescriptionTab, attributes: { locked: false } },
    { component: FieldsTab, attributes: { locked: !isReadableByUser.value } },
    { component: VisualizeTab, attributes: { locked: !isReadableByUser.value } },
  ],
}))

const availableTabs = computed<Set<TabComponents>>(() => {
  const tabs = new Set<TabComponents>()

  currentUser.value?.roleTypes.forEach((role) => {
    const roleTabs = tabImports.value[role]
    roleTabs.forEach((tab) => tabs.add(tab))
  })

  return tabs
})
</script>
