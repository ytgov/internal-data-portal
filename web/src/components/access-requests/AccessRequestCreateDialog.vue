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
        {{ panelAndButtonLabel }}
      </v-btn>
    </template>
    <v-form
      ref="form"
      v-model="isValid"
      @submit.prevent="createAndClose"
    >
      <v-card :loading="isLoading">
        <v-card-title class="text-h5"> {{ panelAndButtonLabel }} </v-card-title>

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
                label="Request on Behalf Of (Program/App) *"
                :rules="[required]"
                variant="outlined"
                required
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-textarea
                v-if="isProjectDescriptionRequired"
                v-model="accessRequest.projectDescription"
                :rules="[required]"
                label="Project Description *"
                rows="5"
                variant="outlined"
                required
              />
              <v-textarea
                v-else
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
            {{ submitButtonLabel }}
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
import { AccessTypes } from "@/api/access-grants-api"
import { computed } from "vue"

const props = withDefaults(
  defineProps<{
    datasetId: number
    requestorId: number
    accessGrantId: number
    accessType: string
    isProjectDescriptionRequired?: boolean
  }>(),
  {
    isProjectDescriptionRequired: false,
  }
)

const emit = defineEmits(["created"])

const { requestorId } = toRefs(props)
const { user: requestor, isLoading: isLoadingUser } = useUser(requestorId)
const snack = useSnack()

const accessRequest = ref<Partial<AccessRequest>>({
  datasetId: props.datasetId,
  accessGrantId: props.accessGrantId,
  requestorId: props.requestorId,
})

const router = useRouter()
const route = useRoute()

const showDialog = ref(route.query.showCreateRequest === "true")
const form = ref<InstanceType<typeof VForm> | null>(null)
const isLoading = ref(false)
const isValid = ref(false)

// TODO: consider breaking the dialog into two separate components
const panelAndButtonLabel = computed(() => {
  return props.accessType === AccessTypes.SELF_SERVE_ACCESS ? "Subscribe" : "Request Access"
})
const submitButtonLabel = computed(() => {
  return props.accessType === AccessTypes.SELF_SERVE_ACCESS ? "Subscribe" : "Request"
})

watch(
  () => [props.datasetId, props.accessGrantId, props.requestorId],
  () => {
    resetAccessRequest()
  },
  { immediate: true }
)

watch(
  () => showDialog.value,
  (value) => {
    if (value) {
      if (route.query.showCreateRequest === "true") {
        return
      }

      router.push({ query: { showCreateRequest: "true" } })
    } else {
      router.push({ query: { showCreateRequest: undefined } })
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
    accessGrantId: props.accessGrantId,
    requestorId: props.requestorId,
  }
}
</script>
