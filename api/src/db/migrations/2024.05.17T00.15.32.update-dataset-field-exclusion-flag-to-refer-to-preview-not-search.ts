import { DataTypes } from "sequelize"

import type { Migration } from "@/db/umzug"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("dataset_fields", "is_excluded_from_preview", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  await queryInterface.sequelize.query(/* sql */ `
    UPDATE dataset_fields
    SET is_excluded_from_preview = 1 -- instead of is_excluded_from_search for security reasons
  `)
  await queryInterface.removeColumn("dataset_fields", "is_excluded_from_search")
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("dataset_fields", "is_excluded_from_search", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  await queryInterface.sequelize.query(/* sql */ `
    UPDATE dataset_fields
    SET is_excluded_from_search = 0 -- instead of is_excluded_from_preview as conceptually different
  `)
  await queryInterface.removeColumn("dataset_fields", "is_excluded_from_preview")
}
