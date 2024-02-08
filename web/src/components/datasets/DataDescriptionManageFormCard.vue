<template>
  <v-card>
    <v-card-title>
      <h3>Data Description</h3>

      TODO: add in form
      <pre>{{ dataset }}</pre>
    </v-card-title>
  </v-card>
</template>

<script lang="ts" setup>
import { toRefs } from "vue"

import { useDataset } from "@/use/use-dataset"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset } = useDataset(slug)
</script>
