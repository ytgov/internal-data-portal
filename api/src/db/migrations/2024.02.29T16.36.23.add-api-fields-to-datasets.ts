import { DataTypes } from "sequelize"

import type { Migration } from "@/db/umzug"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("datasets", "external_api_url", {
    type: DataTypes.STRING(1024),
    allowNull: true,
  })
  await queryInterface.addColumn("datasets", "external_api_header_key", {
    type: DataTypes.STRING(1024),
    allowNull: true,
  })
  await queryInterface.addColumn("datasets", "external_api_header_value", {
    type: DataTypes.STRING(4000),
    allowNull: true,
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn("datasets", "external_api_url")
  await queryInterface.removeColumn("datasets", "external_api_header_key")
  await queryInterface.removeColumn("datasets", "external_api_header_value")
}
