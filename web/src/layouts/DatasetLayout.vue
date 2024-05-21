<template>
  <div
    v-if="isNil(dataset) || isLoading"
    class="d-flex justify-center"
  >
    <PageLoader />
  </div>
  <v-container
    v-else
    class="px-0 px-md-4"
  >
    <h2 class="mb-3">
      {{ dataset.name }}
    </h2>

    <v-tabs v-model="activeTab">
      <component
        :is="component"
        v-for="({ component }, index) in availableTabs"
        :key="index"
        :value="index"
        :slug="slug"
      />
    </v-tabs>

    <router-view></router-view>
  </v-container>
</template>

<script lang="ts" setup>
import { computed, toRefs, defineAsyncComponent, ref } from "vue"
import { isNil } from "lodash"

import useDataset from "@/use/use-dataset"

import PageLoader from "@/components/PageLoader.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset, isLoading, policy } = useDataset(slug)

const activeTab = ref(null)

const DescriptionTab = defineAsyncComponent(
  () => import("@/components/dataset-layout/DescriptionTab.vue")
)
const FieldsTab = defineAsyncComponent(() => import("@/components/dataset-layout/FieldsTab.vue"))
// TODO: access tab only has manage view, which is a bit confusing
const AccessTab = defineAsyncComponent(() => import("@/components/dataset-layout/AccessTab.vue"))
const VisualizeTab = defineAsyncComponent(
  () => import("@/components/dataset-layout/VisualizeTab.vue")
)

type TabComponents = {
  component: typeof DescriptionTab | typeof FieldsTab | typeof AccessTab
}

const canUpdateDataset = computed(() => {
  return policy.value?.update === true
})

const availableTabs = computed<TabComponents[]>(() => {
  if (canUpdateDataset.value) {
    return [
      { component: DescriptionTab },
      { component: FieldsTab },
      { component: AccessTab },
      { component: VisualizeTab },
    ]
  }

  return [{ component: DescriptionTab }, { component: FieldsTab }, { component: VisualizeTab }]
})
</script>
