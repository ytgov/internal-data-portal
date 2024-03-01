import { DataTypes } from "sequelize"

import type { Migration } from "@/db/umzug"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("visualization_controls", "has_search_customizations", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  await queryInterface.sequelize.query(/* sql */ `
    UPDATE visualization_controls
    SET has_search_customizations = has_search_restrictions
  `)
  await queryInterface.removeColumn("visualization_controls", "has_search_restrictions")

  await queryInterface.addColumn("visualization_controls", "has_fields_excluded_from_search", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  await queryInterface.sequelize.query(/* sql */ `
    UPDATE visualization_controls
    SET has_fields_excluded_from_search = has_search_field_restrictions
  `)
  await queryInterface.removeColumn("visualization_controls", "has_search_field_restrictions")
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("visualization_controls", "has_search_field_restrictions", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  await queryInterface.sequelize.query(/* sql */ `
    UPDATE visualization_controls
    SET has_search_field_restrictions = has_fields_excluded_from_search
  `)
  await queryInterface.removeColumn("visualization_controls", "has_fields_excluded_from_search")

  await queryInterface.addColumn("visualization_controls", "has_search_restrictions", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  await queryInterface.sequelize.query(/* sql */ `
    UPDATE visualization_controls
    SET has_search_restrictions = has_search_customizations
  `)
  await queryInterface.removeColumn("visualization_controls", "has_search_customizations")
}
