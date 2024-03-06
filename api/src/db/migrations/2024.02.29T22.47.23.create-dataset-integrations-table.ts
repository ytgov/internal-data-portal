import { DataTypes } from "sequelize"

import type { Migration } from "@/db/umzug"
import { MssqlSimpleTypes } from "@/db/utils/mssql-simple-types"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable("dataset_integrations", {
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
    url: {
      type: DataTypes.STRING(1024),
      allowNull: false,
    },
    header_key: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
    header_value: {
      type: DataTypes.STRING(4000),
      allowNull: true,
    },
    jmes_path_transform: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
    raw_json_data: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    parsed_json_data: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    error_code: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    error_details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    last_success_at: {
      type: MssqlSimpleTypes.DATETIME2(0),
      allowNull: true,
    },
    last_failure_at: {
      type: MssqlSimpleTypes.DATETIME2(0),
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
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable("dataset_integrations")
}
