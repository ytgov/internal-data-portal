<template>Data set new page</template>

<script lang="ts" setup>
import { useBreadcrumbs } from "@/use/use-breadcrumbs"

const { setBreadcrumbs } = useBreadcrumbs()

setBreadcrumbs([
  {
    title: "Create Dataset",
    to: { name: "DataSetNewPage" },
  },
])
</script>
