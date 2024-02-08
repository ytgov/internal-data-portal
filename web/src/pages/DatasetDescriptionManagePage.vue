<template>
  <DataDescriptionFormCard
    :slug="slug"
    class="mt-6"
  />

  <v-row class="mt-6">
    <v-col
      cols="12"
      md="6"
    >
      <OwnerFormCard :slug="slug" />
    </v-col>
    <v-col
      cols="12"
      md="6"
    >
      <SubjectFormCard :slug="slug" />
      <OwnerNotesFormCard
        :slug="slug"
        class="mt-5"
      />
    </v-col>
  </v-row>
</template>

<script lang="ts" setup>
import useBreadcrumbs from "@/use/use-breadcrumbs"

import DataDescriptionFormCard from "@/components/datasets/DataDescriptionFormCard.vue"
import OwnerFormCard from "@/components/datasets/OwnerFormCard.vue"
import SubjectFormCard from "@/components/datasets/SubjectFormCard.vue"
import OwnerNotesFormCard from "@/components/datasets/OwnerNotesFormCard.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { setBreadcrumbs } = useBreadcrumbs()

setBreadcrumbs([
  {
    title: "Dataset",
    to: {
      name: "DatasetPage",
      params: { slug: props.slug },
    },
  },
  {
    title: "Description",
    to: {
      name: "DatasetDescriptionReadPage",
      params: { slug: props.slug },
    },
  },
  {
    title: "Manage",
    to: {
      name: "DatasetDescriptionManagePage",
      params: { slug: props.slug },
    },
  },
])
</script>
