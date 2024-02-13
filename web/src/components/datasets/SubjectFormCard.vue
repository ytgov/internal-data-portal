<template>
  <v-card>
    <v-card-title>Subject</v-card-title>

    <v-card-text>
      <v-form class="d-flex flex-column mt-6">
        <v-row>
          <v-col cols="12">
            <TagsCombobox
              ref="tagsCombobox"
              :model-value="selectedTags"
              label="Keywords"
              variant="outlined"
              @tag-added="addTagging"
              @tag-removed="removeTagging"
              @tag-created="addTaggingAndCreateTag"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, ref, toRefs, watch } from "vue"
import { compact, isNil } from "lodash"

import taggingsApi, { TaggableTypes } from "@/api/taggings-api"
import useTaggings from "@/use/use-taggings"
import useDataset from "@/use/use-dataset"

import TagsCombobox from "@/components/tags/TagsCombobox.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const tagsCombobox = ref<InstanceType<typeof TagsCombobox> | null>(null)

const { slug } = toRefs(props)
const { dataset } = useDataset(slug)

const taggingsQuery = computed(() => ({
  where: {
    taggableType: TaggableTypes.DATASET,
    taggableId: dataset.value?.id,
  },
}))
const { taggings, fetch: fetchTaggings } = useTaggings(taggingsQuery, { immediate: false })
const selectedTags = computed(() => compact(taggings.value.map((tagging) => tagging.tag)))

watch(
  () => dataset.value?.id,
  async (newId) => {
    if (isNil(newId)) return

    await fetchTaggings()
  },
  { immediate: true }
)

async function addTagging(tagId: number) {
  await taggingsApi.create({
    tagId,
    taggableType: TaggableTypes.DATASET,
    taggableId: dataset.value?.id,
  })
  await fetchTaggings()
}

async function removeTagging(tagId: number) {
  const tagging = taggings.value.find((tagging) => tagging.tagId === tagId)
  if (isNil(tagging)) {
    throw new Error(`Tagging not found for tagId: ${tagId}`)
  }

  await taggingsApi.delete(tagging.id)
  await fetchTaggings()
}

async function addTaggingAndCreateTag(tagName: string) {
  await taggingsApi.create({
    taggableType: TaggableTypes.DATASET,
    taggableId: dataset.value?.id,
    tagAttributes: {
      name: tagName,
    },
  })
  await refreshTags()
  await fetchTaggings()
}

async function refreshTags() {
  if (tagsCombobox.value === null) {
    throw new Error("Tags combobox is not defined")
  }

  return tagsCombobox.value.refresh()
}
</script>
