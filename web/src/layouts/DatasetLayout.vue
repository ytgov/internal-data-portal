<template>
  <v-container>
    <h2 class="mb-3">{{ dataset.name }}</h2>

    {{ slug }}

    <router-view></router-view>
  </v-container>
</template>

<script lang="ts" setup>
import { reactive, toRefs } from "vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

function useDataset(slug: string) {
  const state = reactive({
    dataset: {
      name: "TODO: some dataset name",
      slug,
    },
  })

  return { ...toRefs(state) }
}

const { dataset } = useDataset(props.slug)
</script>
