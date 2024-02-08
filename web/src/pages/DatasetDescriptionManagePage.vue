<template>
  {{ slug }}
  <br />
  TODO: implement DatasetDescriptionManagePage
</template>

<script lang="ts" setup>
import useBreadcrumbs from '@/use/use-breadcrumbs';

defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { setBreadcrumbs } = useBreadcrumbs()

setBreadcrumbs([
  {
    title: "Dataset",
    to: { name: "DatasetPage" },
  },
  {
    title: "Description",
    to: { name: "DatasetDescriptionReadPage" },
  },
  {
    title: "Manage",
    to: { name: "DatasetDescriptionManagePage" },
  },
])
</script>
