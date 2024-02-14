<template>
  <v-combobox
    :model-value="modelValue"
    :items="tags"
    :loading="isLoading"
    label="Tags"
    item-value="id"
    item-title="name"
    auto-select-first
    chips
    closable-chips
    multiple
    @update:model-value="updateSelectedTags"
    @update:search="updateSearch"
  ></v-combobox>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { differenceBy } from "lodash"

import useTags, { Tag } from "@/use/use-tags"

const props = withDefaults(
  defineProps<{
    modelValue: Tag[]
  }>(),
  {
    modelValue: () => [],
  }
)

const emit = defineEmits<{
  tagRemoved: [tagId: number]
  tagCreated: [tagName: string]
  tagAdded: [tagId: number]
}>()

// TODO: make use of search token to filter results in the back-end
// Probably best to add a custom /tags/search endpoint?
const searchToken = ref<string>("")

// TODO: once search is implemented, this should be removed.
const tagsQuery = computed(() => ({
  perPage: 1000,
}))
const { tags, isLoading, refresh } = useTags(tagsQuery)

function updateSelectedTags(newSelectedValues: (Tag | string)[]) {
  if (props.modelValue.length > newSelectedValues.length) {
    const tagRemoved = differenceBy(props.modelValue, newSelectedValues, "id")[0]
    emit("tagRemoved", tagRemoved.id)

    return
  }

  const newTagName: string | undefined = newSelectedValues.find(isString)
  if (newTagName === undefined) {
    assertAreTags(newSelectedValues)
    const tagAdded: Tag = differenceBy(newSelectedValues, props.modelValue, "id")[0]
    emit("tagAdded", tagAdded.id)

    return
  }

  emit("tagCreated", newTagName)
}

// TODO: debounce search
function updateSearch(value: string) {
  searchToken.value = value
}

function assertAreTags(values: (Tag | string)[]): asserts values is Tag[] {
  if (values.some(isString)) {
    throw new Error("Expected all values to be tags")
  }
}

function isString(value: Tag | string): value is string {
  return typeof value === "string"
}

defineExpose({
  refresh,
})
</script>
