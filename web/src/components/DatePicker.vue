<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
  >
    <template #activator="{ props }">
      <v-text-field
        :model-value="formattedDate"
        prepend-icon="mdi-calendar"
        readonly
        v-bind="{ ...fieldOptions, ...props }"
      />
    </template>

    <v-date-picker
      v-model="date"
      v-bind="dateOptions"
      @update:model-value="menu = false"
    ></v-date-picker>
  </v-menu>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue"
import { DateTime } from "luxon"
import { VDatePicker, VTextField } from "vuetify/lib/components/index.mjs"

// TODO: support v-model on this component
defineProps<{
  dateOptions?: VDatePicker["$props"]
  fieldOptions?: VTextField["$props"]
}>()

const menu = ref(false)
const date = ref(null)

const formattedDate = computed(() => {
  if (date.value === null) return ""

  const dateTime = DateTime.fromJSDate(date.value)
  return dateTime.toFormat("yyyy-MM-dd")
})
</script>
