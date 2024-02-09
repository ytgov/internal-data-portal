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
        Add API Link
      </v-btn>
    </template>
    <v-form @submit.prevent="saveAndClose">
      <v-card>
        <v-card-title class="text-h5"> Add API Link </v-card-title>

        <v-card-text>
          <v-text-field
            v-model="subscriptionUrl"
            label="API Link"
            variant="outlined"
          />
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="error"
            @click="close"
          >
            Cancel
          </v-btn>
          <v-btn
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
import { ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

const props = defineProps<{
  modelValue: string | null
}>()

const emit = defineEmits(["update:modelValue", "added"])

const router = useRouter()
const route = useRoute()
const showDialog = ref(route.query.showAddApi === "true")
const subscriptionUrl = ref<string | null>(null)

watch(
  () => props.modelValue,
  (value) => {
    subscriptionUrl.value = value
  },
  { immediate: true }
)

watch(
  () => showDialog.value,
  (value) => {
    if (value) {
      router.push({ query: { showAddApi: "true" } })
    } else {
      router.push({ query: { showAddApi: undefined } })
    }
  }
)

function close() {
  showDialog.value = false
}

function saveAndClose() {
  emit("update:modelValue", subscriptionUrl)
  close()
  emit("added")
}
</script>
