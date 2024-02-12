import { QueryTypes } from "sequelize"

import type { Migration } from "@/db/umzug"

export const up: Migration = async ({ context: queryInterface }) => {
  const query = `
    INSERT INTO dataset_stewardships(
      dataset_id,
      owner_id,
      support_id,
      department_id,
      division_id,
      branch_id,
      unit_id,
      created_at,
      updated_at
    )
    SELECT
      dataset_id,
      owner_id,
      support_id,
      department_id,
      division_id,
      branch_id,
      unit_id,
      created_at,
      updated_at
    FROM (
        SELECT
          stewardship_evolutions.dataset_id,
          stewardship_evolutions.owner_id,
          stewardship_evolutions.support_id,
        (
          SELECT id
          FROM user_groups
          WHERE "type" = 'department'
          AND "name" = stewardship_evolutions.department
        ) AS department_id,
        (
          SELECT id
          FROM user_groups
          WHERE "type" = 'division'
          AND "name" = stewardship_evolutions.division
        ) AS division_id,
        (
          SELECT id
          FROM user_groups
          WHERE "type" = 'branch'
          AND "name" = stewardship_evolutions.branch
        ) AS branch_id,
        (
          SELECT id
          FROM user_groups
          WHERE "type" = 'unit'
          AND "name" = stewardship_evolutions.unit
        ) AS unit_id,
        stewardship_evolutions.created_at,
        stewardship_evolutions.updated_at,
        ROW_NUMBER() OVER (PARTITION BY dataset_id ORDER BY updated_at DESC) AS row_number
        FROM stewardship_evolutions
    ) AS filtered_stewardship_evolutions
    WHERE row_number = 1
    AND department_id IS NOT NULL;
  `

  try {
    await queryInterface.sequelize.query(query, { type: QueryTypes.INSERT })
    console.log("Successfully copied latest stewardship evolutions to dataset stewardships")
  } catch (error) {
    console.error("Error copying stewardship evolutions to dataset stewardships:", error)
  }
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.query(`
    DELETE FROM dataset_stewardships WHERE 1=1;
    DBCC CHECKIDENT ('dataset_stewardships', RESEED, 0);
  `)
}
