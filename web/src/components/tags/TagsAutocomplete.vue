<template>
  <v-autocomplete
    v-model="selectedTagNames"
    v-model:search="searchToken"
    :items="tagNames"
    :loading="isLoading"
    label="Tags"
    prepend-inner-icon="mdi-magnify"
    auto-select-first
    chips
    clearable
    closable-chips
    multiple
    @update:model-value="emitSelectedTags"
    @update:search="cancelFetchWhenEmpty"
  >
    <template #prepend-item>
      <v-list-item>
        <v-list-item-title><em>Search for a tag ...</em></v-list-item-title>
      </v-list-item>
    </template>
    <template #no-data>
      <v-list-item v-if="isLoading">
        <v-list-item-title>searching ...</v-list-item-title>
      </v-list-item>
      <v-list-item v-else>
        <v-list-item-title>No tags found</v-list-item-title>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
export { type Tag } from "@/use/use-tags"
</script>

<script lang="ts" setup>
import { computed, ref, watch } from "vue"
import { isEmpty, uniq } from "lodash"

import useTags from "@/use/use-tags"

const props = withDefaults(
  defineProps<{
    modelValue?: string[]
  }>(),
  {
    modelValue: () => [],
  }
)

const emit = defineEmits<{
  "update:modelValue": [tagNames: string[]]
}>()

const selectedTagNames = ref<string[]>(props.modelValue)

watch(
  () => props.modelValue,
  (newValue) => {
    selectedTagNames.value = newValue
  }
)

const searchToken = ref("")
const tagsQuery = computed(() => ({
  perPage: 5,
  searchToken: searchToken.value,
}))
const { tags, isLoading, cancel } = useTags(tagsQuery, { wait: 1000, immediate: false })

const tagNames = computed(() =>
  uniq(tags.value.map(({ name }) => name).concat(selectedTagNames.value))
)

function emitSelectedTags(newSelectedValues: string[]) {
  if (isLoading.value) return

  emit("update:modelValue", newSelectedValues)
}

async function cancelFetchWhenEmpty(searchToken: string) {
  if (isEmpty(searchToken)) {
    cancel()
  }
}
</script>
