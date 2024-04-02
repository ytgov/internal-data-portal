<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-end">
      Subscriptions

      <v-btn @click="emailUsers">Email Users</v-btn>
    </v-card-title>
    <v-card-text>
      <v-skeleton-loader
        v-if="isNil(dataset)"
        type="table"
      />
      <AccessRequestsManageTable
        v-else
        :dataset-id="dataset.id"
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { toRefs } from "vue"
import { isNil } from "lodash"

import http from "@/api/http-client"
import useDataset from "@/use/use-dataset"

import AccessRequestsManageTable from "@/components/access-requests/AccessRequestsManageTable.vue"

const props = defineProps({
  slug: {
    type: String,
    required: true,
  },
})

const { slug } = toRefs(props)
const { dataset } = useDataset(slug)

async function emailUsers() {
  const { data } = await http.post(`/api/datasets/${props.slug}/email-subscribers`, {
    to: "BobHayes@yukon.ca, AmyJbees@yukon.ca, DougHolmes@yukon.ca, LarryFoster@yukon.ca, developer@outside.com",
    subject: "Important Update on Buildings API",
    content: `
      Dear valued users,

      We are reaching out to inform you of some recent updates to the Buildings API. These changes are designed to enhance functionality, improve data accuracy, and provide a more streamlined experience.

      Please note the following updates:
      - Additional data fields have been introduced to include more detailed information on building structures.
      - Several data points have been corrected to reflect the most current and accurate information.
      - The API endpoints have been optimized for better performance and faster response times.

      We recommend reviewing the updated documentation and adjusting your integration where necessary to take full advantage of the new features.

      Thank you for your continued support. Should you have any questions or require assistance, please do not hesitate to reach out.

      Best regards,
      [Your Name/Team]
    `,
  })
  console.log(`data:`, data)
}
</script>
