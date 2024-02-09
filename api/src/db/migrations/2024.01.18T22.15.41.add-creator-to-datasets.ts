import { DataTypes } from "sequelize"

import type { Migration } from "@/db/umzug"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("datasets", "creator_id", {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "users",
      key: "id",
    },
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn("datasets", "creator_id")
}
