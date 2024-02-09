import { DataTypes } from "sequelize"

import type { Migration } from "@/db/umzug"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("access_grants", "creator_id", {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "users",
      key: "id",
    },
  })

  await queryInterface.sequelize.query(`
    UPDATE access_grants
    SET creator_id = owner_id
  `)

  await queryInterface.changeColumn("access_grants", "creator_id", {
    type: DataTypes.INTEGER,
    allowNull: false,
  })

  await queryInterface.removeColumn("access_grants", "owner_id")
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("access_grants", "owner_id", {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "users",
      key: "id",
    },
  })

  await queryInterface.sequelize.query(`
    UPDATE access_grants
    SET owner_id = creator_id
  `)

  await queryInterface.changeColumn("access_grants", "owner_id", {
    type: DataTypes.INTEGER,
    allowNull: false,
  })

  await queryInterface.removeColumn("access_grants", "creator_id")
}
