import { DataTypes } from "sequelize"

import type { Migration } from "@/db/umzug"
import { MssqlSimpleTypes } from "@/db/utils/mssql-simple-types"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable("dataset_fields", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    dataset_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "datasets",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    display_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    data_type: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
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

  await queryInterface.addIndex("dataset_fields", ["dataset_id", "name"], {
    unique: true,
    name: "unique_dataset_fields_on_dataset_id_and_name",
    where: {
      deleted_at: null,
    },
  })

  await queryInterface.addIndex("dataset_fields", ["dataset_id", "display_name"], {
    unique: true,
    name: "unique_dataset_fields_on_dataset_id_and_display_name",
    where: {
      deleted_at: null,
    },
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable("dataset_fields")
}
