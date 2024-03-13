<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
  >
    <v-form @submit.prevent="deleteAndClose">
      <v-card :loading="isLoading">
        <v-card-title class="text-h5"> Delete User </v-card-title>

        <v-card-text>
          <v-row>
            <v-col>
              <v-text-field
                :model-value="user.displayName"
                label="Name"
                append-inner-icon="mdi-lock"
                readonly
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                :model-value="user.email"
                label="Email"
                append-inner-icon="mdi-lock"
                readonly
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                v-model="user.position"
                label="Postion"
                append-inner-icon="mdi-lock"
                readonly
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                :model-value="department"
                label="Department"
                append-inner-icon="mdi-lock"
                readonly
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                :model-value="roleTypes"
                label="Role"
                append-inner-icon="mdi-lock"
                readonly
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :loading="isLoading"
            color="primary"
            @click="close"
          >
            Cancel
          </v-btn>
          <v-btn
            :loading="isLoading"
            color="error"
            type="submit"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts" setup>
import { cloneDeep, isEmpty, isNil } from "lodash"
import { computed, nextTick, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRoute, useRouter } from "vue-router"

import { VForm } from "vuetify/lib/components/index.mjs"

import usersApi, { User } from "@/api/users-api"
import useSnack from "@/use/use-snack"

const emit = defineEmits(["deleted"])

const snack = useSnack()

const user = ref<Partial<User>>({})
const userId = computed(() => user.value.id)
const department = computed(() => {
  const { department, division, branch, unit } = user.value
  return [department, division, branch, unit].filter(Boolean).join(" - ")
})

const { t } = useI18n()
const roleTypes = computed(() => {
  const { roleTypes } = user.value
  if (isNil(roleTypes) || isEmpty(roleTypes)) return ""

  const formatedRoleTypes = roleTypes.map((roleType) => t(`roles.role_types.${roleType}`, roleType))
  return formatedRoleTypes.join(", ")
})

const router = useRouter()
const route = useRoute()

const showDialog = ref(false)
const isLoading = ref(false)

watch(
  () => showDialog.value,
  (value) => {
    if (value) {
      if (route.query.showDelete === userId.value?.toString()) {
        return
      }

      router.push({ query: { showDelete: userId.value } })
    } else {
      router.push({ query: { showDelete: undefined } })
    }
  }
)

function show(newUser: User) {
  user.value = cloneDeep(newUser)
  showDialog.value = true
}

function close() {
  showDialog.value = false
  resetUser()
}

async function deleteAndClose() {
  isLoading.value = true
  try {
    if (userId.value === undefined) {
      throw new Error("User id could not be found")
    }

    await usersApi.delete(userId.value)
    close()

    await nextTick()
    emit("deleted", userId.value)
    snack.notify("User deleted", { color: "success" })
  } catch (error) {
    snack.notify(`Failed to delete user ${error}`, { color: "error" })
  } finally {
    isLoading.value = false
  }
}

function resetUser() {
  user.value = {}
}

defineExpose({
  show,
})
</script>
