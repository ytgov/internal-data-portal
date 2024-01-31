import { DataTypes, Op } from "sequelize"

import type { Migration } from "@/db/umzug"
import { MssqlSimpleTypes } from "@/db/utils/mssql-simple-types"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable("access_grants", {
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
    requestor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    grant_level: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    access_type: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    is_project_description_required: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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

  await queryInterface.addIndex("access_grants", ["dataset_id", "grant_level", "access_type"], {
    unique: true,
    name: "unique_access_grants_on_dataset_id_and_grant_level_and_access_type",
    where: {
      deleted_at: null,
    },
  })

  await queryInterface.addIndex("access_grants", ["dataset_id", "requestor_id"], {
    unique: true,
    name: "unique_access_grants_on_dataset_id_and_requestor_id",
    where: {
      requestor_id: { [Op.ne]: null },
      deleted_at: null,
    },
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable("access_grants")
}
