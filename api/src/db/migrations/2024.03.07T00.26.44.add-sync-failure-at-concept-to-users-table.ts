import type { Migration } from "@/db/umzug"
import { MssqlSimpleTypes } from "@/db/utils/mssql-simple-types"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("users", "last_sync_success_at", {
    type: MssqlSimpleTypes.DATETIME2(0),
    allowNull: true,
  })
  await queryInterface.sequelize.query(/* sql */ `
    UPDATE users
    SET last_sync_success_at = last_employee_directory_sync_at
  `)
  await queryInterface.removeColumn("users", "last_employee_directory_sync_at")

  await queryInterface.addColumn("users", "last_sync_failure_at", {
    type: MssqlSimpleTypes.DATETIME2(0),
    allowNull: true,
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn("users", "last_sync_failure_at")

  await queryInterface.addColumn("users", "last_employee_directory_sync_at", {
    type: MssqlSimpleTypes.DATETIME2(0),
    allowNull: true,
  })
  await queryInterface.sequelize.query(/* sql */ `
    UPDATE users
    SET last_employee_directory_sync_at = last_sync_success_at
  `)
  await queryInterface.removeColumn("users", "last_sync_success_at")
}
