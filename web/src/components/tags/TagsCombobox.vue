<template>
  <v-combobox
    :model-value="modelValue"
    :items="tags"
    :loading="isLoading"
    label="Tags"
    item-value="id"
    item-title="name"
    chips
    multiple
    closable-chips
    @update:model-value="updateSelectedTags"
    @update:search="updateSearch"
  ></v-combobox>
</template>

<script lang="ts" setup>
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
  "tag-removed": (tagId: number) => void
  "tag-created": (tagName: string) => void
  "tag-added": (tagId: number) => void
}>()

const { tags, isLoading } = useTags()

function updateSelectedTags(newSelectedValues: (Tag | string)[]) {
  if (props.modelValue.length > newSelectedValues.length) {
    const tagRemoved = differenceBy(props.modelValue, newSelectedValues, "id")[0]
    emit("tag-removed", tagRemoved.id)

    return
  }

  const newTagName: string | undefined = newSelectedValues.find(isString)
  if (newTagName === undefined) {
    const tagAdded = differenceBy(newSelectedValues, props.modelValue, "id")[0]
    emit("tag-added", tagAdded.id)

    return
  }

  emit("tag-created", newTagName)
}

function isString(value: Tag | string): value is string {
  return typeof value === "string"
}

function updateSearch(value: string) {
  console.log(`TODO: filter tag search from value:`, value)
}
</script>
