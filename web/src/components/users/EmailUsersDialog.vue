<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
  >
    <template #activator="{ props: dialogProps }">
      <v-btn
        color="primary"
        variant="outlined"
        v-bind="dialogProps"
      >
        Email Users
      </v-btn>
    </template>
    <v-form
      ref="form"
      v-model="isValid"
      @submit.prevent="emailUsersAndClose"
    >
      <v-card :loading="isLoading">
        <v-card-title class="text-h5"> Email Users </v-card-title>

        <v-card-text>
          <v-row>
            <v-col>
              <SubscribersEmailsCombobox
                v-model="mail.to"
                :dataset-id="props.datasetId"
                :rules="[required]"
                label="Email *"
                required
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                v-model="mail.subject"
                :rules="[required]"
                label="Title *"
                required
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-textarea
                v-model="mail.body"
                label="Content"
                rows="8"
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
            Send
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
import emailSubscribersApi, { type Mail } from "@/api/datasets/email-subscribers-api"
import useSnack from "@/use/use-snack"

import SubscribersEmailsCombobox from "@/components/users/SubscribersEmailsCombobox.vue"

const props = defineProps<{
  datasetId: number
  datasetName: string
}>()

const emit = defineEmits(["created"])

const snack = useSnack()

const mail = ref<Mail>({
  to: [],
  subject: `${props.datasetName} API: `,
  body: "",
})

const router = useRouter()
const route = useRoute()
const showDialog = ref(route.query.showEmail === "true")
const form = ref<InstanceType<typeof VForm> | null>(null)
const isLoading = ref(false)
const isValid = ref(false)

watch(
  () => props.datasetId,
  () => {
    resetMail()
  },
  { immediate: true }
)

watch(
  () => showDialog.value,
  (value) => {
    if (value) {
      router.push({ query: { showEmail: "true" } })
    } else {
      router.push({ query: { showEmail: undefined } })
    }
  }
)

function close() {
  showDialog.value = false
  resetMail()
  form.value?.resetValidation()
}

async function emailUsersAndClose() {
  if (!isValid.value) {
    snack.notify("Please fill out all required fields", {
      color: "error",
    })
    return
  }

  isLoading.value = true
  try {
    await emailSubscribersApi.create(props.datasetId, mail.value)
    close()

    await nextTick()
    emit("created")
    snack.notify("Emailed subsribers", { color: "success" })
  } catch (error) {
    snack.notify(`Failed to email subscribers ${error}`, { color: "error" })
  } finally {
    isLoading.value = false
  }
}

function resetMail() {
  mail.value = {
    to: [],
    subject: `${props.datasetName} API: `,
    body: "",
  }
}
</script>
