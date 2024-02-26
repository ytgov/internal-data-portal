import { QueryTypes } from "sequelize"

import type { Migration } from "@/db/umzug"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.query(
    /* sql */ `
      INSERT INTO
        visualization_controls(dataset_id)
      SELECT
        id
      FROM
        datasets;
    `,
    { type: QueryTypes.INSERT }
  )
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.query(
    /* sql */ `
      DELETE FROM
        visualization_controls
      WHERE 1=1;
    `,
    { type: QueryTypes.DELETE }
  )
  // Reset the auto-increment counter
  await queryInterface.sequelize.query(
    /* sql */ `
      DBCC CHECKIDENT ('visualization_controls', RESEED, 0);
    `,
    { type: QueryTypes.UPDATE }
  )
}
