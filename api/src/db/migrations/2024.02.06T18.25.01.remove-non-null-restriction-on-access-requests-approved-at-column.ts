import type { Migration } from "@/db/umzug"
import { MssqlSimpleTypes } from "@/db/utils/mssql-simple-types"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.changeColumn("access_requests", "approved_at", {
    type: MssqlSimpleTypes.DATETIME2(0),
    allowNull: true,
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.changeColumn("access_requests", "approved_at", {
    type: MssqlSimpleTypes.DATETIME2(0),
    allowNull: false,
  })
}
