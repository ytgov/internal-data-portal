<template>
  <!--
    Currently this is single select, if multiple roles are needed,
    make this a multi-select.
  -->
  <v-select
    :model-value="modelValue"
    :items="roleTypesValues"
    label="Role Type"
    v-bind="$attrs"
    @update:model-value="updateModelValue"
  ></v-select>
</template>

<script lang="ts" setup>
import { useI18n } from "vue-i18n"

import { RoleTypes } from "@/api/users-api"

defineProps<{
  modelValue: RoleTypes | undefined
}>()

const emit = defineEmits(["update:modelValue"])

const { t } = useI18n()

const ORDERED_ROLES = [
  RoleTypes.USER,
  RoleTypes.DATA_OWNER,
  RoleTypes.BUSINESS_ANALYST,
  RoleTypes.SYSTEM_ADMIN,
]

const roleTypesValues = Object.values(ORDERED_ROLES)
  .map((value) => ({
    title: t(`roles.role_types.${value}`),
    value,
  }))

function updateModelValue(value: RoleTypes | undefined) {
  emit("update:modelValue", value)
}
</script>
