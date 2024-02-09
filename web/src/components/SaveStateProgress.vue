<template>
  <v-progress-circular
    v-if="isSaving"
    indeterminate
    color="primary"
    size="30"
    width="4"
  />
  <v-icon
    v-else
    size="30"
    :color="isInPostSaveStateTemporarily ? 'green' : 'light-green'"
    :class="{ pulse: isInPostSaveStateTemporarily }"
  >
    mdi-check-circle
  </v-icon>
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
  animation: pulseAnimation 500ms forwards;
}

@keyframes pulseAnimation {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.3);
  }
}
</style>
