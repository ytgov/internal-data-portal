import { DataTypes } from "sequelize"

import type { Migration } from "@/db/umzug"
import { MssqlSimpleTypes } from "@/db/utils/mssql-simple-types"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable("search_field_exclusions")
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable("search_field_exclusions", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    visualization_control_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "visualization_controls",
        key: "id",
      },
    },
    dataset_field_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "dataset_fields",
        key: "id",
      },
    },
    created_at: {
      type: MssqlSimpleTypes.DATETIME2(0),
      allowNull: false,
      defaultValue: MssqlSimpleTypes.NOW,
    },
    updated_at: {
      type: MssqlSimpleTypes.DATETIME2(0),
      allowNull: false,
      defaultValue: MssqlSimpleTypes.NOW,
    },
    deleted_at: {
      type: MssqlSimpleTypes.DATETIME2(0),
      allowNull: true,
    },
  })

  await queryInterface.addIndex(
    "search_field_exclusions",
    ["visualization_control_id", "dataset_field_id"],
    {
      unique: true,
      name: "unique_search_field_exclusions_on_visualization_control_id_and_dataset_field_id",
      where: {
        deleted_at: null,
      },
    }
  )
}
