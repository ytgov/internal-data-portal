import { DataTypes } from "sequelize"

import type { Migration } from "@/db/umzug"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("dataset_integrations", "estimated_size_in_bytes", {
    type: DataTypes.INTEGER,
    allowNull: true,
  })

  await queryInterface.addColumn("dataset_integrations", "estimated_number_of_records", {
    type: DataTypes.INTEGER,
    allowNull: true,
  })

  await queryInterface.addColumn("dataset_integrations", "estimated_response_time_in_ms", {
    type: DataTypes.INTEGER,
    allowNull: true,
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn("dataset_integrations", "estimated_size_in_bytes")
  await queryInterface.removeColumn("dataset_integrations", "estimated_number_of_records")
  await queryInterface.removeColumn("dataset_integrations", "estimated_response_time_in_ms")
}
