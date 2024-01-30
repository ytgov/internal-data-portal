import { DataTypes } from "sequelize"

import type { Migration } from "@/db/umzug"
import { MssqlSimpleTypes } from "@/db/utils/mssql-simple-types"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable("user_groups", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    // null for top level of hierarchy
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "user_groups",
        key: "id",
      },
    },
    // enum of "department", "division", "branch", "unit"
    type: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    last_division_directory_sync_at: {
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
  await queryInterface.dropTable("user_groups")
}
