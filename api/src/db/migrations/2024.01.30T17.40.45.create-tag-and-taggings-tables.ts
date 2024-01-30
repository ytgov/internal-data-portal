import { DataTypes } from "sequelize"

import type { Migration } from "@/db/umzug"
import { MssqlSimpleTypes } from "@/db/utils/mssql-simple-types"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.createTable("tags", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
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

  await queryInterface.addIndex("tags", ["name"], {
    unique: true,
    name: "unique_tags_name",
    where: {
      deleted_at: null,
    },
  })

  await queryInterface.createTable("taggings", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    tag_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "tags",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    taggable_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    taggable_type: {
      type: DataTypes.STRING(255),
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

  await queryInterface.addIndex("taggings", ["tag_id", "taggable_type", "taggable_id"], {
    unique: true,
    name: "unique_taggings_on_tag_id_and_taggable_type_and_taggable_id",
    where: {
      deleted_at: null,
    },
  })

  await queryInterface.addIndex("taggings", ["taggable_type", "taggable_id"], {
    name: "index_taggings_on_taggable_type_and_taggable_id",
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.dropTable("taggings")
  await queryInterface.dropTable("tags")
}
