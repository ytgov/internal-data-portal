<template>
  <v-select
    :model-value="modelValue"
    :items="GRANT_LEVEL_VALUES"
    label="Shared With"
    v-bind="$attrs"
    @update:model-value="updateModelValue"
  ></v-select>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n"

import { GrantLevels } from "@/api/access-grants-api"

defineProps<{
  modelValue: GrantLevels | undefined
}>()

const emit = defineEmits(["update:modelValue"])

const { t } = useI18n()

const GRANT_LEVEL_VALUES = Object.values(GrantLevels).map((value) => ({
  title: t(`access_grants.grant_levels.${value}`),
  value,
}))

function updateModelValue(value: GrantLevels | undefined) {
  emit("update:modelValue", value)
}
</script>
