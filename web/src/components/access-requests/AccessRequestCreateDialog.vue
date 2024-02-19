<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
  >
    <template #activator="{ props: dialogProps }">
      <v-btn
        color="primary"
        v-bind="dialogProps"
      >
        Request Access
      </v-btn>
    </template>
    <v-form
      ref="form"
      v-model="isValid"
      @submit.prevent="createAndClose"
    >
      <v-card :loading="isLoading">
        <v-card-title class="text-h5"> Request Access </v-card-title>

        <v-card-text v-if="isNil(accessRequest)">
          <v-skeleton-loader type="card" />
        </v-card-text>
        <v-card-text v-else>
          <v-row>
            <v-col>
              <UserAttributeTextField
                :model-value="requestorId"
                label="Name"
                attribute="displayName"
                variant="outlined"
                append-inner-icon="mdi-lock"
                readonly
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <UserGroupAutocomplete
                :model-value="requestor?.groupMembership.departmentId"
                :loading="isLoadingUser"
                :type="UserGroupTypes.DEPARTMENT"
                label="Department"
                variant="outlined"
                append-inner-icon="mdi-lock"
                readonly
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                v-model="accessRequest.projectName"
                label="Request on Behalf Of (Program/App)"
                :rules="[required]"
                variant="outlined"
                required
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <!-- TODO: required if project description is required -->
              <v-textarea
                v-model="accessRequest.projectDescription"
                label="Project Description"
                rows="5"
                variant="outlined"
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
            Request
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts" setup>
import { nextTick, ref, toRefs, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { isNil } from "lodash"

import { VForm } from "vuetify/lib/components/index.mjs"

import { required } from "@/utils/validators"
import accessRequestsApi, { AccessRequest } from "@/api/access-requests-api"
import useSnack from "@/use/use-snack"
import useUser from "@/use/use-user"

import UserAttributeTextField from "@/components/users/UserAttributeTextField.vue"
import UserGroupAutocomplete, {
  UserGroupTypes,
} from "@/components/user-groups/UserGroupAutocomplete.vue"

const props = defineProps({
  datasetId: {
    type: Number,
    required: true,
  },
  requestorId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(["created"])

const { requestorId } = toRefs(props)
const { user: requestor, isLoading: isLoadingUser } = useUser(requestorId)
const snack = useSnack()

const accessRequest = ref<Partial<AccessRequest>>({
  datasetId: props.datasetId,
  requestorId: props.requestorId,
})

const router = useRouter()
const route = useRoute()

const showDialog = ref(route.query.showCreate === "true")
const form = ref<InstanceType<typeof VForm> | null>(null)
const isLoading = ref(false)
const isValid = ref(false)

watch(
  () => [props.datasetId, props.requestorId],
  () => {
    resetAccessRequest()
  },
  { immediate: true }
)

watch(
  () => showDialog.value,
  (value) => {
    if (value) {
      if (route.query.showCreate === "true") {
        return
      }

      router.push({ query: { showCreate: "true" } })
    } else {
      router.push({ query: { showCreate: undefined } })
    }
  }
)

function close() {
  showDialog.value = false
  resetAccessRequest()
}

async function createAndClose() {
  if (!isValid.value) {
    snack.notify("Please fill out all required fields", {
      color: "error",
    })
    return
  }

  isLoading.value = true
  try {
    const { accessRequest: newAccessRequest } = await accessRequestsApi.create(accessRequest.value)
    close()

    await nextTick()
    emit("created", newAccessRequest.id)
    snack.notify("Access request created", { color: "success" })
  } catch (error) {
    snack.notify(`Failed to create access request ${error}`, { color: "error" })
  } finally {
    isLoading.value = false
  }
}

function resetAccessRequest() {
  accessRequest.value = {
    datasetId: props.datasetId,
    requestorId: props.requestorId,
  }
}
</script>
