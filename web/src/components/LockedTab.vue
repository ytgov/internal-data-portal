<template>
  <v-tooltip>
    <template #activator="{ props }">
      <span v-bind="props">
        <v-tab
          disabled
          append-icon="mdi-lock"
        >
          <template #append><slot name="append"></slot></template>
          <template #default><slot name="default"></slot></template>
          <template #loader><slot name="loader"></slot></template>
          <template #prepend><slot name="prepend"></slot></template>
        </v-tab>
      </span>
    </template>
    <span class="text-white">You do not have permission to view this tab.</span>
  </v-tooltip>
</template>

<script lang="ts" setup></script>
