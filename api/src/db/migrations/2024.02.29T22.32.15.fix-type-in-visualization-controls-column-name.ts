import { DataTypes } from "sequelize"

import type { Migration } from "@/db/umzug"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("visualization_controls", "is_downloadable_as_csv", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  await queryInterface.sequelize.query(/* sql */ `
    UPDATE visualization_controls
    SET is_downloadable_as_csv = is_dowloadable_as_csv
  `)
  await queryInterface.removeColumn("visualization_controls", "is_dowloadable_as_csv")
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("visualization_controls", "is_dowloadable_as_csv", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  await queryInterface.sequelize.query(/* sql */ `
    UPDATE visualization_controls
    SET is_dowloadable_as_csv = is_downloadable_as_csv
  `)
  await queryInterface.removeColumn("visualization_controls", "is_downloadable_as_csv")
}
