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
          @update:model-value="debouncedEmitSearchUpdate"
        />
      </v-col>
      <v-col align-self="center">
        <v-btn
          color="primary"
          variant="outlined"
          prepend-icon="mdi-filter"
          @click="toggleAdvancedFilters"
          >Advanced Filters</v-btn
        >
      </v-col>
    </v-row>
    <v-row v-if="modelValue">
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
          @update:model-value="emitTagNamesUpdate"
          @click:clear="clearTagsFilters"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { debounce, isEmpty } from "lodash"
import { computed, ref } from "vue"

import { DatasetsFilters } from "@/api/datasets-api"
import { useRoute } from "vue-router"

import TagsAutocomplete from "@/components/tags/TagsAutocomplete.vue"

const props = withDefaults(
  defineProps<{
    modelValue: boolean
  }>(),
  {
    modelValue: false,
  }
)

const emit = defineEmits<{
  "update:modelValue": [showAdvancedFilters: boolean, searchFilters: DatasetsFilters]
  "update:filters": [searchFilters: DatasetsFilters]
  "click:clear": [void]
}>()

const route = useRoute()
const initialFilters = (route.query.filters as DatasetsFilters) ?? {}
const searchToken = ref<string | undefined>(initialFilters.search)
const tagNames = ref<string[]>(initialFilters.withTagNames ?? [])

function clearTagsFilters() {
  tagNames.value = []
}

async function toggleAdvancedFilters() {
  tagNames.value = []
  emit("update:modelValue", !props.modelValue, {
    ...filters.value,
    withTagNames: undefined,
  })
}

function emptyToUndefined<T>(value: T): T | undefined {
  return !isEmpty(value) ? value : undefined
}

const filters = computed<DatasetsFilters>(() => {
  return {
    search: emptyToUndefined(searchToken.value),
    withTagNames: emptyToUndefined(tagNames.value),
  }
})

function emitSearchUpdate(newSearch: string) {
  emit("update:filters", {
    ...filters.value,
    search: emptyToUndefined(newSearch),
  })
}

const debouncedEmitSearchUpdate = debounce(emitSearchUpdate, 1000)

function emitTagNamesUpdate(newTagNames: string[]) {
  emit("update:filters", {
    ...filters.value,
    withTagNames: newTagNames,
  })
}
</script>
