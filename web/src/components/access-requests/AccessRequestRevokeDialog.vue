<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
  >
    <v-form @submit.prevent="revokeAndClose">
      <v-card :loading="isLoading">
        <v-card-title class="text-h5"> Revoke Access </v-card-title>

        <v-card-text v-if="isNil(accessRequest)">
          <v-skeleton-loader type="card" />
        </v-card-text>
        <v-card-text v-else>
          <v-row>
            <v-col>
              <UserAttributeTextField
                :model-value="accessRequest.requestorId"
                label="Name"
                item-title="displayName"
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
            Revoke
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

const emit = defineEmits(["revoked"])

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
      if (route.query.showRevoke === accessRequestId.value?.toString()) {
        return
      }

      router.push({ query: { showRevoke: accessRequestId.value } })
    } else {
      router.push({ query: { showRevoke: undefined } })
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

async function revokeAndClose() {
  isLoading.value = true
  try {
    if (accessRequestId.value === undefined) {
      throw new Error("Access request id could not be found")
    }

    const { accessRequest: newAccessRequest } = await accessRequestsApi.revoke(
      accessRequestId.value
    )
    close()

    await nextTick()
    emit("revoked", newAccessRequest.id)
    snack.notify("Access request revoked", { color: "success" })
  } catch (error) {
    snack.notify(`Failed to revoke access request ${error}`, { color: "error" })
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
