<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
  >
    <template #activator="{ props: menuProps }">
      <v-text-field
        :model-value="formattedDate"
        prepend-icon="mdi-calendar"
        readonly
        v-bind="{ ...fieldOptions, ...menuProps }"
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
import { computed, ref, watch } from "vue"
import { DateTime } from "luxon"
import { VDatePicker, VTextField } from "vuetify/lib/components/index.mjs"

const props = defineProps<{
  modelValue: string | null
  dateOptions?: VDatePicker["$props"]
  fieldOptions?: VTextField["$props"]
}>()

const emit = defineEmits(["update:modelValue"])

const menu = ref(false)
const date = ref<Date | null>(null)

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue === null) {
      date.value = null
      return
    }

    const newDateTime = DateTime.fromISO(newValue)
    if (date.value === null) {
      date.value = newDateTime.toJSDate()
      return
    }

    // This avoids triggering an infinite loop
    const newDateString = newDateTime.toFormat("yyyy-MM-dd")
    const currentDateTime = DateTime.fromJSDate(date.value)
    const currentDateString = currentDateTime.toFormat("yyyy-MM-dd")
    if (newDateString === currentDateString) return

    date.value = newDateTime.toJSDate()
  },
  {
    immediate: true,
  }
)

const formattedDate = computed(() => {
  if (date.value === null) return ""

  const dateTime = DateTime.fromJSDate(date.value)
  const dateString = dateTime.toFormat("yyyy-MM-dd")

  emit("update:modelValue", dateString)

  return dateString
})
</script>
