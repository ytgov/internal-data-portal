import { DataTypes } from "sequelize"

import type { Migration } from "@/db/umzug"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("visualization_controls", "has_preview", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  await queryInterface.sequelize.query(/* sql */ `
    UPDATE visualization_controls
    SET has_preview = 0 -- instead of has_search_customizations for security reasons
  `)
  await queryInterface.removeColumn("visualization_controls", "has_search_customizations")

  await queryInterface.addColumn("visualization_controls", "has_fields_excluded_from_preview", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  await queryInterface.sequelize.query(/* sql */ `
    UPDATE visualization_controls
    SET has_fields_excluded_from_preview = 1 -- instead of has_fields_excluded_from_search for security reasons
  `)
  await queryInterface.removeColumn("visualization_controls", "has_fields_excluded_from_search")

  await queryInterface.addColumn("visualization_controls", "has_preview_row_limit", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  await queryInterface.sequelize.query(/* sql */ `
    UPDATE visualization_controls
    SET has_preview_row_limit = 1 -- instead of has_search_row_limits for security reasons
  `)
  await queryInterface.removeColumn("visualization_controls", "has_search_row_limits")

  await queryInterface.addColumn("visualization_controls", "preview_row_limit", {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10,
  })
  await queryInterface.sequelize.query(/* sql */ `
    UPDATE visualization_controls
    SET preview_row_limit = ISNULL(search_row_limit_maximum, 10)
  `)
  await queryInterface.removeColumn("visualization_controls", "search_row_limit_maximum")
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("visualization_controls", "search_row_limit_maximum", {
    type: DataTypes.INTEGER,
    allowNull: true,
  })
  await queryInterface.sequelize.query(/* sql */ `
    UPDATE visualization_controls
    SET search_row_limit_maximum = preview_row_limit
  `)
  await queryInterface.removeColumn("visualization_controls", "preview_row_limit")

  await queryInterface.addColumn("visualization_controls", "has_search_row_limits", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  await queryInterface.sequelize.query(/* sql */ `
    UPDATE visualization_controls
    SET has_search_row_limits = has_preview_row_limit
  `)
  await queryInterface.removeColumn("visualization_controls", "has_preview_row_limit")

  await queryInterface.addColumn("visualization_controls", "has_search_customizations", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  await queryInterface.sequelize.query(/* sql */ `
    UPDATE visualization_controls
    SET has_search_customizations = has_preview
  `)
  await queryInterface.removeColumn("visualization_controls", "has_preview")

  await queryInterface.addColumn("visualization_controls", "has_fields_excluded_from_search", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  await queryInterface.sequelize.query(/* sql */ `
    UPDATE visualization_controls
    SET has_fields_excluded_from_search = has_fields_excluded_from_preview
  `)
  await queryInterface.removeColumn("visualization_controls", "has_fields_excluded_from_preview")
}
