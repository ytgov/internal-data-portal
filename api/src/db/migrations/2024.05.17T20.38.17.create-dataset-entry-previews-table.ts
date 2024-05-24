import { DataTypes, Op } from "sequelize"

import type { Migration } from "@/db/umzug"
import { MssqlSimpleTypes } from "@/db/utils/mssql-simple-types"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable("dataset_entry_previews", {
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
    dataset_entry_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "dataset_entries",
        key: "id",
      },
    },
    json_data: {
      type: DataTypes.TEXT,
      allowNull: false,
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

  await queryInterface.addIndex("dataset_entry_previews", ["dataset_id"])
  await queryInterface.addIndex("dataset_entry_previews", ["dataset_entry_id"], {
    unique: true,
    where: {
      deleted_at: {
        [Op.is]: null,
      },
    },
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable("dataset_entry_previews")
}
