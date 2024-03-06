<template>
  <v-autocomplete
    :model-value="selectedTagNames"
    :items="selectedTagNames"
    :loading="isLoading"
    label="Tags"
    prepend-inner-icon="mdi-magnify"
    chips
    closable-chips
    multiple
    @update:model-value="updateSelectedTags"
    @update:search="debouncedSearch"
  >
    <template #prepend-item>
      <v-list-item>
        <em>Search for a tag ...</em>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script lang="ts" >
export { type Tag } from "@/use/use-tags"
</script>

<script lang="ts" setup>
import { ref } from "vue"
import { debounce, isEmpty } from "lodash"

import useTags from "@/use/use-tags"

const selectedTagNames = ref<string[]>([])
const searchToken = ref("")
const tagsQuery = ref({
  perPage: 5,
  searchToken: searchToken.value,
})
// TODO: add support for { isWatchEnabled: false }
const { tags, isLoading, fetch } = useTags(tagsQuery)

function updateSelectedTags(newSelectedValues: string[]) {
  selectedTagNames.value = newSelectedValues
}

async function search (newSearchToken: string) {
  const isStaleSearch = tags.value.some((tag) => tag.name === newSearchToken)
  if (isStaleSearch) return

  searchToken.value = newSearchToken
  if (isEmpty(searchToken.value)) return

  await fetch()
}

const debouncedSearch = debounce(search, 500)
</script>
