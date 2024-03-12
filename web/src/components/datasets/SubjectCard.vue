<template>
  <v-card>
    <v-card-title> Subject </v-card-title>
    <v-card-text>
      <v-form class="d-flex flex-column mt-6">
        <v-row>
          <v-col cols="12">
            <!-- TODO: replace with readonly variant -->
            <TagsCombobox
              :model-value="selectedTags"
              label="Keywords"
              append-inner-icon="mdi-lock"
              variant="outlined"
              :closable-chips="false"
              readonly
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, toRefs } from "vue"
import { compact } from "lodash"

import { TaggableTypes } from "@/api/taggings-api"
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
const { taggings } = useTaggings(taggingsQuery, { immediate: false })
const selectedTags = computed(() => compact(taggings.value.map((tagging) => tagging.tag)))
</script>
