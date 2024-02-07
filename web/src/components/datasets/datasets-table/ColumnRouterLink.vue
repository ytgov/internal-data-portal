<template>
  <router-link
    :to="{
      name: 'DatasetDescriptionManagePage',
      params: { slug },
    }"
    :tabindex="tabindex"
    class="row-link"
  />
</template>

<!-- See https://robertcooper.me/post/table-row-links -->
<script lang="ts" setup>
defineProps({
  slug: {
    type: String,
    required: true,
  },
  tabindex: {
    type: String,
    default: "-1",
  },
})
</script>

<style scoped>
/*
Requires the following in the parent:

::v-deep td {
  position: relative;
}
*/
td > .row-link {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  text-decoration: none;
  color: inherit;
}
</style>
