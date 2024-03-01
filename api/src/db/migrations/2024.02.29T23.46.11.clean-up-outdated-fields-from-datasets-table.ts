import { DataTypes } from "sequelize"

import type { Migration } from "@/db/umzug"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn("datasets", "external_api_url")
  await queryInterface.removeColumn("datasets", "external_api_header_key")
  await queryInterface.removeColumn("datasets", "external_api_header_value")
  await queryInterface.removeColumn("datasets", "status")
  await queryInterface.removeColumn("datasets", "error_code")
  await queryInterface.removeColumn("datasets", "error_details")
  await queryInterface.removeColumn("datasets", "subscription_url")
  await queryInterface.removeColumn("datasets", "subscription_access_code")
}

export const down: Migration = async ({ context: queryInterface }) => {
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
  await queryInterface.addColumn("datasets", "status", {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: "ok",
  })
  await queryInterface.addColumn("datasets", "error_code", {
    type: DataTypes.STRING(100),
    allowNull: true,
  })
  await queryInterface.addColumn("datasets", "error_details", {
    type: DataTypes.TEXT,
    allowNull: true,
  })
  await queryInterface.addColumn("datasets", "subscription_url", {
    type: DataTypes.STRING(1024),
    allowNull: true,
  })
  await queryInterface.addColumn("datasets", "subscription_access_code", {
    type: DataTypes.STRING(255),
    allowNull: true,
  })
}
