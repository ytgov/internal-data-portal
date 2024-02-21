import { DataTypes } from "sequelize"

import type { Migration } from "@/db/umzug"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn("datasets", "is_subscribable")
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("datasets", "is_subscribable", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
}
