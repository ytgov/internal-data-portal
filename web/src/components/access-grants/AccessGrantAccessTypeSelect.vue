<template>
  <v-select
    :model-value="modelValue"
    :items="ACCESS_TYPE_VALUES"
    label="Access Type"
    v-bind="$attrs"
    @update:model-value="updateModelValue"
  ></v-select>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n"

import { AccessTypes } from "@/api/access-grants-api"

defineProps<{
  modelValue: AccessTypes | undefined
}>()

const emit = defineEmits(["update:modelValue"])

const { t } = useI18n()

const ACCESS_TYPE_VALUES = Object.values(AccessTypes).map((value) => ({
  title: t(`access_grants.access_types.${value}`),
  value,
}))

function updateModelValue(value: AccessTypes | undefined) {
  emit("update:modelValue", value)
}
</script>
