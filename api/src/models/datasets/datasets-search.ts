import { literal } from "sequelize"
import { Literal } from "sequelize/types/utils"

import { compactSql } from "@/utils/compact-sql"

/**
 * Requires replacements to be passed in to query.
 * e.g. { replacements: { searchTokenWildcard: `%${searchToken}%`, searchToken }
 */
export function datasetsSearch(): Literal {
  const matchingEntries = compactSql(/*sql*/ `
    (
      SELECT
        DISTINCT datasets.id
      FROM
        datasets
      WHERE
        datasets.deleted_at IS NULL
        AND (
          LOWER(datasets.name) LIKE LOWER(:searchTokenWildcard)
          OR LOWER(datasets.description) LIKE LOWER(:searchTokenWildcard)
          OR EXISTS (
            SELECT
              1
            FROM
              taggings
              INNER JOIN tags ON taggings.tag_id = tags.id
              AND datasets.id = taggings.taggable_id
              AND taggings.taggable_type = 'Dataset'
              AND tags.deleted_at IS NULL
              AND taggings.deleted_at IS NULL
              AND LOWER(tags.name) LIKE LOWER(:searchTokenWildcard)
          )
          OR EXISTS (
            SELECT
              1
            FROM
              user_groups
              INNER JOIN dataset_stewardships ON (
                (
                  dataset_stewardships.department_id = user_groups.id
                  AND user_groups.type = 'department'
                )
                OR (
                  dataset_stewardships.department_id IS NOT NULL
                  AND dataset_stewardships.division_id = user_groups.id
                  AND user_groups.type = 'division'
                )
                OR (
                  dataset_stewardships.department_id IS NOT NULL
                  AND dataset_stewardships.division_id IS NOT NULL
                  AND dataset_stewardships.branch_id = user_groups.id
                  AND user_groups.type = 'branch'
                )
                OR (
                  dataset_stewardships.department_id IS NOT NULL
                  AND dataset_stewardships.division_id IS NOT NULL
                  AND dataset_stewardships.branch_id IS NOT NULL
                  AND dataset_stewardships.unit_id = user_groups.id
                  AND user_groups.type = 'unit'
                )
              )
              AND datasets.id = dataset_stewardships.dataset_id
              AND dataset_stewardships.deleted_at IS NULL
              AND user_groups.deleted_at IS NULL
              AND (
                LOWER(user_groups.name) LIKE LOWER(:searchTokenWildcard)
                OR user_groups.acronym = :searchToken
              )
          )
        )
      )
  `)

  return literal(matchingEntries)
}

export default datasetsSearch
