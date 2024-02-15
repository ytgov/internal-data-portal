<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
  >
    <v-form
      ref="form"
      v-model="isValid"
      @submit.prevent="updateAndClose"
    >
      <v-card :loading="isLoading">
        <v-card-title class="text-h5"> Edit Access </v-card-title>

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
              <!-- <v-text-field
                v-model="accessGrant.displayName"
                :rules="[required]"
                label="Display Name *"
                required
              /> -->
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <!-- <v-textarea
                v-model="accessGrant.description"
                label="Field Description"
                rows="6"
              /> -->
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <!-- <v-select
                v-model="accessGrant.dataType"
                :items="accessGrantTypes"
                :rules="[required]"
                label="Data Type *"
                required
              /> -->
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
import { computed, nextTick, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { cloneDeep } from "lodash"

import { VForm } from "vuetify/lib/components/index.mjs"

import { required } from "@/utils/validators"
import accessGrantsApi, { AccessGrant } from "@/api/access-grants-api"
import useSnack from "@/use/use-snack"

import AccessGrantGrantLevelSelect from "@/components/access-grants/AccessGrantGrantLevelSelect.vue"

const emit = defineEmits(["saved"])

const snack = useSnack()

const accessGrant = ref<Partial<AccessGrant>>({})
const accessGrantId = computed(() => accessGrant.value.id)

const router = useRouter()
const route = useRoute()

const showDialog = ref(false)
const form = ref<InstanceType<typeof VForm> | null>(null)
const isLoading = ref(false)
const isValid = ref(false)

watch(
  () => showDialog.value,
  (value) => {
    if (value) {
      if (route.query.showEdit === accessGrantId.value?.toString()) {
        return
      }

      router.push({ query: { showEdit: accessGrantId.value } })
    } else {
      router.push({ query: { showEdit: undefined } })
    }
  }
)

function show(newAccessGrant: AccessGrant) {
  accessGrant.value = cloneDeep(newAccessGrant)
  showDialog.value = true
}

function close() {
  showDialog.value = false
  resetAccessGrant()
  form.value?.resetValidation()
}

async function updateAndClose() {
  if (!isValid.value) {
    snack.notify("Please fill out all required fields", {
      color: "error",
    })
    return
  }

  isLoading.value = true
  try {
    if (accessGrantId.value === undefined) {
      throw new Error("Access grant id could not be found")
    }

    const { accessGrant: newAccessGrant } = await accessGrantsApi.update(
      accessGrantId.value,
      accessGrant.value
    )
    close()

    await nextTick()
    emit("saved", newAccessGrant.id)
    snack.notify("Access grant saved", { color: "success" })
  } catch (error) {
    snack.notify(`Failed to save access grant ${error}`, { color: "error" })
  } finally {
    isLoading.value = false
  }
}

function resetAccessGrant() {
  accessGrant.value = {}
}

defineExpose({
  show,
})
</script>
