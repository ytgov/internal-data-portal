<template>
  <v-card>
    <v-card-title>Data Search</v-card-title>
    <v-card-text>
      <v-form>
        <v-row>
          <v-col>
            <TagsCombobox
              v-model="keywords"
              label="Keywords"
              variant="outlined"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <UserGroupAutocomplete
              v-model="departmentId"
              label="Department"
              variant="outlined"
              :type="UserGroupTypes.DEPARTMENT"
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-btn
              color="primary"
              variant="outlined"
              :to="{ name: 'DatasetsPage' }"
            >
              Browse all data
            </v-btn>
          </v-col>
          <v-col class="d-flex justify-end">
            <v-btn
              :to="{ name: 'DatasetsPage', query: searchQuery }"
              color="primary"
              type="submit"
              >Search</v-btn
            >
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { type LocationQueryRaw } from "vue-router";

import TagsCombobox, { Tag } from "@/components/tags/TagsCombobox.vue"
import UserGroupAutocomplete, {
  UserGroupTypes,
} from "@/components/user-groups/UserGroupAutocomplete.vue"

const keywords = ref<Tag[]>([])
const departmentId = ref<number>()

/**
 * As we are parsing with Qs, we are ignoring the invalid type information
 */
const searchQuery = computed(() => {
  return {
    where: {
      departmentId: departmentId.value,
      keywords: keywords.value,
    },
  } as unknown as LocationQueryRaw
})
</script>
