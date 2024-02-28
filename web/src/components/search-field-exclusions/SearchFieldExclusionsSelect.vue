<template>
  <v-select
    :model-value="selectedDatasetFields"
    :items="datasetFields"
    :loading="isLoading"
    label="Search Field Exclusions"
    item-value="id"
    item-title="displayName"
    chips
    closable-chips
    multiple
    @update:model-value="updateSelectedDatasetFields"
  >
    <template
      v-if="isSaving"
      #append-inner
    >
      <v-progress-circular
        size="20"
        width="2"
        color="yg-blue"
        indeterminate
      />
    </template>
  </v-select>
</template>

<script lang="ts" setup>
import { computed } from "vue"
import { isNil, keyBy } from "lodash"

import useDatasetFields, { DatasetField } from "@/use/use-dataset-fields"

const props = withDefaults(
  defineProps<{
    modelValue: DatasetField["id"][]
    datasetId: number
    isSaving?: boolean
  }>(),
  {
    modelValue: () => [],
    isSaving: false,
  }
)

const emit = defineEmits<{
  "update:modelValue": [datasetFieldIds: DatasetField["id"][]]
}>()

const datasetFieldsQuery = computed(() => ({
  where: {
    datasetId: props.datasetId,
  },
  // TODO: implement back-end search with combobox and remove max per page
  perPage: 1000,
}))
const { datasetFields, isLoading, refresh } = useDatasetFields(datasetFieldsQuery)

const datasetFieldsById = computed(() => keyBy(datasetFields.value, "id"))
const selectedDatasetFields = computed(() =>
  props.modelValue.reduce<DatasetField[]>((accumulator, id) => {
    const item = datasetFieldsById.value[id]
    if (!isNil(item)) {
      accumulator.push(item)
    }

    return accumulator
  }, [])
)

/**
 * NOTE: return type of `VSelect@update:model-value` is a lie,
 * actual return type is number[], _not_ DatasetField[] | undefined
 */
function updateSelectedDatasetFields(newSelectedValues: unknown[]) {
  assertValuesAreNumbers(newSelectedValues)
  emit("update:modelValue", newSelectedValues)
}

// Handles bug in VSelect@update:model-value typing
function assertValuesAreNumbers(values: unknown[]): asserts values is number[] {
  if (values.some((value) => typeof value !== "number")) {
    throw new Error("Expected values to be array of numbers")
  }
}

defineExpose({
  refresh,
})
</script>
