import { DataTypes } from "sequelize"

import type { Migration } from "@/db/umzug"
import { MssqlSimpleTypes } from "@/db/utils/mssql-simple-types"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable("access_requests", {
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
    access_grant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "access_grants",
        key: "id",
      },
    },
    requestor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    denier_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    approver_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    revoker_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    access_code: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    project_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    project_description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    approved_at: {
      type: MssqlSimpleTypes.DATETIME2(0),
      allowNull: false,
      defaultValue: MssqlSimpleTypes.NOW,
    },
    denied_at: {
      type: MssqlSimpleTypes.DATETIME2(0),
      allowNull: true,
    },
    denial_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    revoked_at: {
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

  await queryInterface.addIndex("access_requests", ["dataset_id", "requestor_id"], {
    unique: true,
    name: "unique_access_requests_on_dataset_id_and_requestor_id",
    where: {
      deleted_at: null,
    },
  })
  await queryInterface.addIndex("access_requests", ["access_grant_id", "requestor_id"], {
    unique: true,
    name: "unique_access_requests_on_access_grant_id_and_requestor_id",
    where: {
      deleted_at: null,
    },
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable("access_requests")
}
