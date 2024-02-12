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
import { computed } from "vue"

import useTaggings from "@/use/use-taggings"

import TagsCombobox from "@/components/tags/TagsCombobox.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const taggingsQuery = computed(() => ({
  dataset: {
    slug: props.slug,
  },
}))
const { taggings } = useTaggings(taggingsQuery)
const selectedTags = computed(() => taggings.value.map((tagging) => tagging.tag))

function addTagging(tagId: number) {
  alert(`TODO: implement add tagging for ${tagId}`)
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
