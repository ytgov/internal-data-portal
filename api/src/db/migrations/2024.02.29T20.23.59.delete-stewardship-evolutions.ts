import { DataTypes } from "sequelize"

import type { Migration } from "@/db/umzug"
import { MssqlSimpleTypes } from "@/db/utils/mssql-simple-types"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable("stewardship_evolutions")
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable("stewardship_evolutions", {
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
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    support_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    owner_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    owner_position: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    support_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    support_email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    support_position: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    division: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    branch: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING(255),
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
