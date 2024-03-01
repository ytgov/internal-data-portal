import { DataTypes } from "sequelize"

import type { Migration } from "@/db/umzug"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("dataset_fields", "is_excluded_from_search", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })

  await queryInterface.sequelize.query(/* sql */ `
    UPDATE
      dataset_fields
    SET
      dataset_fields.is_excluded_from_search = 1
    FROM
      dataset_fields
    INNER JOIN search_field_exclusions
      ON search_field_exclusions.dataset_field_id = dataset_fields.id;
  `)
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn("dataset_fields", "is_excluded_from_search")
}
