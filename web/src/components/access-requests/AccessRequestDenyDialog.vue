<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
  >
    <v-form @submit.prevent="denyAndClose">
      <v-card :loading="isLoading">
        <v-card-title class="text-h5"> Deny Access </v-card-title>

        <v-card-text v-if="isNil(accessRequest)">
          <v-skeleton-loader type="card" />
        </v-card-text>
        <v-card-text v-else>
          <v-row>
            <v-col>
              <UserAttributeTextField
                :model-value="accessRequest.requestorId"
                label="Name"
                attribute="displayName"
                append-inner-icon="mdi-lock"
                variant="outlined"
                readonly
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                :model-value="accessRequest.requestorDepartmentName"
                label="Department"
                append-inner-icon="mdi-lock"
                variant="outlined"
                readonly
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                :model-value="accessRequest.projectName"
                label="Request on Behalf Of (Program/App)"
                append-inner-icon="mdi-lock"
                variant="outlined"
                readonly
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-textarea
                :model-value="accessRequest.projectDescription"
                label="Project Description"
                append-inner-icon="mdi-lock"
                rows="5"
                variant="outlined"
                readonly
              />
            </v-col>
          </v-row>
          <v-divider
            :thickness="2"
            class="mb-4"
          />
          <v-row>
            <v-col>
              <v-textarea
                :model-value="denialReason"
                label="Denial Reason"
                rows="5"
                variant="outlined"
                @update:model-value="updateDenialReason"
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
            variant="elevated"
          >
            Deny
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { cloneDeep, isEmpty, isNil } from "lodash"

import accessRequestsApi, { AccessRequestTableView } from "@/api/access-requests-api"
import useSnack from "@/use/use-snack"

import UserAttributeTextField from "@/components/users/UserAttributeTextField.vue"

const emit = defineEmits(["denied"])

const snack = useSnack()

const accessRequest = ref<AccessRequestTableView | null>()
const accessRequestId = computed(() => accessRequest.value?.id)
const denialReason = ref<string | null>(null)

const router = useRouter()
const route = useRoute()

const showDialog = ref(false)
const isLoading = ref(false)

function updateDenialReason(value: string) {
  if (isEmpty(value)) {
    denialReason.value = null
  } else {
    denialReason.value = value
  }
}

watch(
  () => showDialog.value,
  (value) => {
    if (value) {
      if (route.query.showDeny === accessRequestId.value?.toString()) {
        return
      }

      router.push({ query: { showDeny: accessRequestId.value } })
    } else {
      router.push({ query: { showDeny: undefined } })
    }
  }
)

function show(newAccessRequest: AccessRequestTableView) {
  accessRequest.value = cloneDeep(newAccessRequest)
  showDialog.value = true
}

function close() {
  showDialog.value = false
  resetAccessRequest()
}

async function denyAndClose() {
  isLoading.value = true
  try {
    if (accessRequestId.value === undefined) {
      throw new Error("Access request id could not be found")
    }

    const { accessRequest: newAccessRequest } = await accessRequestsApi.deny(
      accessRequestId.value,
      {
        denialReason: denialReason.value,
      }
    )
    close()

    await nextTick()
    emit("denied", newAccessRequest.id)
    snack.notify("Access request denied", { color: "success" })
  } catch (error) {
    snack.notify(`Failed to deny access request ${error}`, { color: "error" })
  } finally {
    isLoading.value = false
  }
}

function resetAccessRequest() {
  accessRequest.value = null
}

defineExpose({
  show,
})
</script>
