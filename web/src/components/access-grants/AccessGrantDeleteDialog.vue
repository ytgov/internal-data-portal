<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
  >
    <v-form @submit.prevent="deleteAndClose">
      <v-card :loading="isLoading">
        <v-card-title class="text-h5"> Remove Access </v-card-title>

        <v-card-text v-if="isNil(accessGrant)">
          <v-skeleton-loader type="text" />
        </v-card-text>
        <v-card-text v-else>
          <v-row>
            <v-col>
              <AccessGrantGrantLevelSelect
                v-model="accessGrant.grantLevel"
                readonly
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <!-- <v-text-field
                v-model="accessGrant.displayName"
                label="Display Name"
                readonly
              /> -->
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <!-- <v-textarea
                v-model="accessGrant.description"
                label="Field Description"
                rows="6"
                readonly
              /> -->
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <!-- <v-select
                v-model="accessGrant.dataType"
                :items="accessGrantTypes"
                label="Data Type"
                readonly
              /> -->
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
            Remove
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { isNil, cloneDeep } from "lodash"

import { VForm } from "vuetify/lib/components/index.mjs"

import accessGrantsApi, { AccessGrant } from "@/api/access-grants-api"
import useSnack from "@/use/use-snack"

import AccessGrantGrantLevelSelect from "@/components/access-grants/AccessGrantGrantLevelSelect.vue"

const emit = defineEmits(["deleted"])

const snack = useSnack()

const accessGrant = ref<AccessGrant | null>(null)
const accessGrantId = computed(() => accessGrant.value?.id)

const router = useRouter()
const route = useRoute()

const showDialog = ref(false)
const isLoading = ref(false)

watch(
  () => showDialog.value,
  (value) => {
    if (value) {
      if (route.query.showDelete === accessGrantId.value?.toString()) {
        return
      }

      router.push({ query: { showDelete: accessGrantId.value } })
    } else {
      router.push({ query: { showDelete: undefined } })
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
}

async function deleteAndClose() {
  isLoading.value = true
  try {
    if (accessGrantId.value === undefined) {
      throw new Error("Access grant id could not be found")
    }

    await accessGrantsApi.delete(accessGrantId.value)
    close()

    await nextTick()
    emit("deleted", accessGrantId.value)
    snack.notify("Access grant deleted", { color: "success" })
  } catch (error) {
    snack.notify(`Failed to delete access grant ${error}`, { color: "error" })
  } finally {
    isLoading.value = false
  }
}

function resetAccessGrant() {
  accessGrant.value = null
}

defineExpose({
  show,
})
</script>
