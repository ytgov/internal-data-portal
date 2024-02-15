<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
  >
    <v-form @submit.prevent="denyAndClose">
      <v-card :loading="isLoading">
        <v-card-title class="text-h5"> Deny Access </v-card-title>

        <v-card-text>
          <v-row>
            <v-col> TODO: add info </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :loading="isLoading"
            color="primary"
            variant="outlined"
            @click="close"
          >
            Cancel
          </v-btn>
          <v-btn
            :loading="isLoading"
            color="error"
            type="submit"
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
import { cloneDeep } from "lodash"

import accessRequestsApi, { AccessRequest } from "@/api/access-requests-api"
import useSnack from "@/use/use-snack"

const emit = defineEmits(["denied"])

const snack = useSnack()

const accessRequest = ref<Partial<AccessRequest>>({})
const accessRequestId = computed(() => accessRequest.value.id)

const router = useRouter()
const route = useRoute()

const showDialog = ref(false)
const isLoading = ref(false)

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

function show(newAccessRequest: AccessRequest) {
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
        denialReason: "TODO: add reason",
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
  accessRequest.value = {}
}

defineExpose({
  show,
})
</script>
