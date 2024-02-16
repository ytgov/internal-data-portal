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
        Add Access
      </v-btn>
    </template>
    <v-form
      ref="form"
      v-model="isValid"
      @submit.prevent="createAndClose"
    >
      <v-card :loading="isLoading">
        <v-card-title class="text-h5"> Grant Access </v-card-title>

        <v-card-text>
          <v-row>
            <v-col>
              <AccessGrantGrantLevelSelect
                v-model="accessGrant.grantLevel"
                :rules="[required]"
                label="Shared With *"
                required
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <AccessGrantAccessTypeSelect
                v-model="accessGrant.accessType"
                :rules="[required]"
                label="Access Type *"
                required
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <UserSearchableAutocomplete
                v-model="accessGrant.supportId"
                label="Request Email"
                clearable
                auto-select-first
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-checkbox
                v-model="accessGrant.isProjectDescriptionRequired"
                label="Project Description Required?"
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
            color="primary"
            type="submit"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts" setup>
import { nextTick, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

import { VForm } from "vuetify/lib/components/index.mjs"

import { required } from "@/utils/validators"
import accessGrantsApi, { AccessGrant } from "@/api/access-grants-api"
import useSnack from "@/use/use-snack"

import AccessGrantGrantLevelSelect from "@/components/access-grants/AccessGrantGrantLevelSelect.vue"
import AccessGrantAccessTypeSelect from "@/components/access-grants/AccessGrantAccessTypeSelect.vue"
import UserSearchableAutocomplete from "@/components/users/UserSearchableAutocomplete.vue"

const props = defineProps({
  datasetId: {
    type: Number,
    default: () => null,
  },
})

const emit = defineEmits(["created"])

const snack = useSnack()

const accessGrant = ref<Partial<AccessGrant>>({
  datasetId: props.datasetId,
})

const router = useRouter()
const route = useRoute()
const showDialog = ref(route.query.showCreate === "true")
const form = ref<InstanceType<typeof VForm> | null>(null)
const isLoading = ref(false)
const isValid = ref(false)

watch(
  () => props.datasetId,
  () => {
    resetAccessGrant()
  },
  { immediate: true }
)

watch(
  () => showDialog.value,
  (value) => {
    if (value) {
      router.push({ query: { showCreate: "true" } })
    } else {
      router.push({ query: { showCreate: undefined } })
    }
  }
)

function close() {
  showDialog.value = false
  resetAccessGrant()
  form.value?.resetValidation()
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
    const { accessGrant: newAccessGrant } = await accessGrantsApi.create(accessGrant.value)
    close()

    await nextTick()
    emit("created", newAccessGrant.id)
    snack.notify("Access grant created", { color: "success" })
  } catch (error) {
    snack.notify(`Failed to create access grant ${error}`, { color: "error" })
  } finally {
    isLoading.value = false
  }
}

function resetAccessGrant() {
  accessGrant.value = {
    datasetId: props.datasetId,
  }
}
</script>
