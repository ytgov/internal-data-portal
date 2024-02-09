import { DataTypes } from "sequelize"

import type { Migration } from "@/db/umzug"
import { MssqlSimpleTypes } from "@/db/utils/mssql-simple-types"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable("datasets", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    owner_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    subscription_url: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    subscription_access_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    is_subscribable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_spatial_data: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    is_live_data: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    terms_of_use: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    credits: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    owner_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'ok',
    },
    error_code: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    error_details: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    published_at: {
      type: MssqlSimpleTypes.DATETIME2(0),
      allowNull: true,
    },
    deactivated_at: {
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

  await queryInterface.addIndex("datasets", ["slug"], {
    unique: true,
    name: "unique_datasets_slug",
    where: {
      deleted_at: null,
    },
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable("datasets")
}
