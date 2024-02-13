<template>
  <v-progress-circular
    v-if="isSaving"
    indeterminate
    color="primary"
    size="26"
    width="2"
  />
  <v-btn
    v-else
    :color="isInPostSaveStateTemporarily ? 'success' : 'primary'"
    :class="{ pulse: isInPostSaveStateTemporarily }"
    variant="outlined"
    rounded="circle"
    size="26"
    title="Save"
    v-bind="$attrs"
  >
    <v-icon size="18">mdi-check</v-icon>
  </v-btn>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue"
const props = defineProps({
  saving: Boolean,
})
const isSaving = ref(props.saving)
const isInPostSaveStateTemporarily = ref(false)
watch(
  () => props.saving,
  (newValue) => {
    isSaving.value = newValue
    if (!newValue) {
      isInPostSaveStateTemporarily.value = true
      setTimeout(() => (isInPostSaveStateTemporarily.value = false), 500)
    }
  }
)
</script>

<style scoped>
.pulse {
  animation: pulseAnimation 300ms forwards;
}
@keyframes pulseAnimation {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}
</style>
