<template>
  <v-container>
    <h2 class="mb-3">{{ dataset.name }}</h2>

    {{ datasetSlug }}

    <router-view></router-view>
  </v-container>
</template>

<script lang="ts" setup>
import { reactive, toRefs } from "vue"

const props = defineProps({
  datasetSlug: {
    type: String,
    required: true,
  },
})

function useDataset(datasetSlug: string) {
  const state = reactive({
    dataset: {
      name: 'TODO: some dataset name',
    },
  })

  return { ...toRefs(state) }
}

const { dataset } = useDataset(props.datasetSlug)
</script>
