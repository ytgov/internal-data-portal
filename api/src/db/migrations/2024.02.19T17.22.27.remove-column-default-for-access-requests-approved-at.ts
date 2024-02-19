import type { Migration } from "@/db/umzug"
import { MssqlSimpleTypes } from "@/db/utils/mssql-simple-types"
import { removeConstraint } from "@/db/utils/mssql-drop-constraint"

export const up: Migration = async ({ context: queryInterface }) => {
  await removeConstraint(queryInterface, "access_requests", {
    type: "default",
    fields: ["approved_at"],
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addConstraint("access_requests", {
    type: "default",
    fields: ["approved_at"],
    defaultValue: MssqlSimpleTypes.NOW,
  })
}
