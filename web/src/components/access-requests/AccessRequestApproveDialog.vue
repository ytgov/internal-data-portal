<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
  >
    <v-form @submit.prevent="approveAndClose">
      <v-card :loading="isLoading">
        <v-card-title class="text-h5"> Approve Access </v-card-title>

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
                rows="5"
                variant="outlined"
                readonly
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :loading="isLoading"
            color="error"
            @click="close"
          >
            Cancel
          </v-btn>
          <v-btn
            :loading="isLoading"
            color="success"
            type="submit"
            variant="elevated"
          >
            Approve
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { cloneDeep, isNil } from "lodash"

import accessRequestsApi, { AccessRequestTableView } from "@/api/access-requests-api"
import useSnack from "@/use/use-snack"

import UserAttributeTextField from "@/components/users/UserAttributeTextField.vue"

const emit = defineEmits(["approved"])

const snack = useSnack()

const accessRequest = ref<AccessRequestTableView | null>()
const accessRequestId = computed(() => accessRequest.value?.id)

const router = useRouter()
const route = useRoute()

const showDialog = ref(false)
const isLoading = ref(false)

watch(
  () => showDialog.value,
  (value) => {
    if (value) {
      if (route.query.showApprove === accessRequestId.value?.toString()) {
        return
      }

      router.push({ query: { showApprove: accessRequestId.value } })
    } else {
      router.push({ query: { showApprove: undefined } })
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

async function approveAndClose() {
  isLoading.value = true
  try {
    if (accessRequestId.value === undefined) {
      throw new Error("Access request id could not be found")
    }

    const { accessRequest: newAccessRequest } = await accessRequestsApi.approve(
      accessRequestId.value
    )
    close()

    await nextTick()
    emit("approved", newAccessRequest.id)
    snack.notify("Access request approved", { color: "success" })
  } catch (error) {
    snack.notify(`Failed to approve access request ${error}`, { color: "error" })
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
