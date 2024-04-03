<template>
  <v-combobox
    v-model:search="search"
    :model-value="modelValue"
    label="Enter some emails"
    :items="items"
    :loading="isLoading"
    :hide-no-data="false"
    :delimiters="[';']"
    chips
    closable-chips
    hide-selected
    multiple
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #no-data>
      <v-list-item>
        <v-list-item-title>
          No subscriber matching "<strong>{{ search }}</strong
          >". Press <kbd>enter</kbd> to add email.
        </v-list-item-title>
      </v-list-item>
    </template>
  </v-combobox>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue"

import emailSubscribersApi from "@/api/datasets/email-subscribers-api"

const props = withDefaults(
  defineProps<{
    modelValue: string[]
    datasetId: number
  }>(),
  {
    modelValue: () => [],
  }
)

const emit = defineEmits<{
  "update:modelValue": [selectedEmails: string[]]
}>()

const items = ref<string[]>([])
const search = ref(null)
const isLoading = ref(false)

watch(
  () => props.datasetId,
  async (newDatasetId) => {
    isLoading.value = true
    try {
      const { users } = await emailSubscribersApi.list(newDatasetId)
      const usersEmails = users.map((user) => user.email)
      items.value = usersEmails
      emit("update:modelValue", usersEmails)
    } catch (error) {
      console.error(`Failed to fetch subscribers for dataset ${newDatasetId}: ${error}`)
    } finally {
      isLoading.value = false
    }
  },
  {
    immediate: true,
  }
)
</script>
