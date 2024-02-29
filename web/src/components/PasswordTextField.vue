<template>
  <v-text-field
    :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
    :type="visible ? 'text' : 'password'"
    placeholder="Enter your password"
    prepend-inner-icon="mdi-lock-outline"
    @click:append-inner="visible = !visible"
  ></v-text-field>
</template>

<script setup lang="ts">
import { ref } from "vue"

const visible = ref(false)
</script>
