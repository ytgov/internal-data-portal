<template>
  <v-card>
    <v-card-title>Subject</v-card-title>

    <v-card-text>
      <v-form
        class="d-flex flex-column mt-6"
        @submit.prevent="saveWrapper"
      >
        <v-row>
          <v-col cols="12">
            <TagsCombobox
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

import { Tag } from "@/api/tags-api"
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

const { slug } = toRefs(props)
const { dataset } = useDataset(slug)

const taggingsQuery = computed(() => ({
  where: {
    taggableType: TaggableTypes.DATASET,
    taggableId: dataset.value?.id,
  },
}))
const { taggings, fetch: fetchTaggings } = useTaggings(taggingsQuery, { immediate: false })
const selectedTags = ref<Tag[]>([])

watch(
  () => dataset.value?.id,
  async (newId) => {
    if (isNil(newId)) return

    await fetchTaggings()
    selectedTags.value = compact(taggings.value.map((tagging) => tagging.tag))
  },
  { immediate: true }
)

async function addTagging(tagId: number) {
  const { tagging } = await taggingsApi.create({
    tagId,
    taggableType: TaggableTypes.DATASET,
    taggableId: dataset.value?.id,
  })
  const { tag } = tagging
  selectedTags.value.push(tag)
}

function removeTagging(tagId: number) {
  alert(`TODO: implement remove tagging for ${tagId}`)
}

function addTaggingAndCreateTag(tagName: string) {
  alert(`TODO: implement add tagging and create tag for ${tagName}`)
}

function saveWrapper() {
  alert("TODO: implement save")
}
</script>
