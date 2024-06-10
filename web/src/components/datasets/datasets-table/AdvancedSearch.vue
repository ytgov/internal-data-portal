<template>
  <v-container>
    <v-row>
      <v-col
        cols="12"
        md="4"
      >
        <v-text-field
          v-model="searchToken"
          prepend-inner-icon="mdi-magnify"
          label="Search"
          variant="outlined"
          hide-details
          clearable
          persistent-clear
          @click:clear="clearSearchQuery"
        />
      </v-col>
      <v-col align-self="center">
        <v-btn
          color="primary"
          variant="outlined"
          @click="toggleAdvancedFilters"
          >Advanced Filters</v-btn
        >
      </v-col>
    </v-row>
    <v-row v-if="isShowingAdvancedFilters">
      <v-col
        cols="12"
        md="4"
      >
        <TagsAutocomplete
          v-model="tagNames"
          label="Add Tags Filters"
          variant="outlined"
          clearable
          persistent-clear
          @click:clear="clearTagsFilters"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { debounce } from "lodash"
import { computed, ref } from "vue"

import { DatasetsFilters } from "@/api/datasets-api"

const emit = defineEmits<{
  "update:modelValue": [searchFilters: DatasetsFilters]
  "click:clear": [void]
}>()
import TagsAutocomplete from "@/components/tags/TagsAutocomplete.vue"
import { watch } from "vue"

const searchToken = ref("")
const tagNames = ref<string[]>([])
const isShowingAdvancedFilters = ref(false)

function clearSearchQuery() {
  searchToken.value = ""
  emit("click:clear")
}

function clearTagsFilters() {
  tagNames.value = []
}

function toggleAdvancedFilters() {
  tagNames.value = []
  isShowingAdvancedFilters.value = !isShowingAdvancedFilters.value
}

const filters = computed<DatasetsFilters>(() => ({
  search: searchToken.value,
  withTagNames: tagNames.value,
}))

function emitSearchUpdate(newSearch: string) {
  emit("update:modelValue", {
    ...filters.value,
    search: newSearch,
  })
}

const debouncedEmitSearchUpdate = debounce(emitSearchUpdate, 1000)

watch(searchToken, (newSearch) => {
  debouncedEmitSearchUpdate(newSearch)
})

watch(
  () => [tagNames.value], // add other non-search filters here
  () => {
    emit("update:modelValue", filters.value)
  }
)
</script>
