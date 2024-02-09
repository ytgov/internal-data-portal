import { DataTypes } from "sequelize"

import type { Migration } from "@/db/umzug"

import { MssqlSimpleTypes } from "@/db/utils/mssql-simple-types"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable("user_group_memberships", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      unique: true,
    },
    department_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "user_groups",
        key: "id",
      },
    },
    division_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "user_groups",
        key: "id",
      },
    },
    branch_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "user_groups",
        key: "id",
      },
    },
    unit_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "user_groups",
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

  await queryInterface.removeColumn("users", "department")
  await queryInterface.removeColumn("users", "division")
  await queryInterface.removeColumn("users", "branch")
  await queryInterface.removeColumn("users", "unit")
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable("user_group_memberships")

  await queryInterface.addColumn("users", "department", {
    type: DataTypes.STRING(100),
    allowNull: true,
  })
  await queryInterface.addColumn("users", "division", {
    type: DataTypes.STRING(100),
    allowNull: true,
  })
  await queryInterface.addColumn("users", "branch", {
    type: DataTypes.STRING(100),
    allowNull: true,
  })
  await queryInterface.addColumn("users", "unit", {
    type: DataTypes.STRING(100),
    allowNull: true,
  })
}
