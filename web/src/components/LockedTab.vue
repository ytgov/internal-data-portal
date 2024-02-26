<template>
  <v-tooltip>
    <template #activator="{ props }">
      <span v-bind="props">
        <v-tab
          disabled
          append-icon="mdi-lock"
        >
          <template
            v-for="(slotName, index) of slotNames"
            :key="`${slotName}-${index}`"
            #[slotName]
            ><slot :name="slotName"></slot
          ></template>
        </v-tab>
      </span>
    </template>
    <span class="text-white">You do not have permission to view this tab.</span>
  </v-tooltip>
</template>

<script lang="ts" setup>
import { useSlots } from "vue"

import { VTab } from "vuetify/lib/components/index.mjs"

const slots = useSlots()

const slotNames = Object.keys(slots) as Array<keyof VTab["$slots"]>
</script>
