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
      SELECT DISTINCT
        datasets.id
      FROM
        datasets
      WHERE
        datasets.deleted_at IS NULL
        AND (
          LOWER(datasets.name) LIKE LOWER(:searchTokenWildcard)
          OR LOWER(datasets.description) LIKE LOWER(:searchTokenWildcard)
          OR EXISTS (
            SELECT 1
            FROM taggings
            INNER JOIN tags ON taggings.tag_id = tags.id
              AND tags.deleted_at IS NULL
            WHERE taggings.deleted_at IS NULL
              AND datasets.id = taggings.taggable_id
              AND taggings.taggable_type = 'Dataset'
              AND LOWER(tags.name) LIKE LOWER(:searchTokenWildcard)
          )
          OR EXISTS (
            SELECT 1
            FROM user_groups
            INNER JOIN dataset_stewardships ON dataset_stewardships.department_id = user_groups.id
            -- FROM dataset_stewardships
            -- WHERE dataset_stewardships.deleted_at IS NULL
            --   AND datasets.id = dataset_stewardships.dataset_id
            --   AND (
            --     LOWER(dataset_stewardships.department) LIKE LOWER(:searchTokenWildcard)
            --     OR LOWER(dataset_stewardships.division) LIKE LOWER(:searchTokenWildcard)
            --     OR LOWER(dataset_stewardships.branch) LIKE LOWER(:searchTokenWildcard)
            --     OR LOWER(dataset_stewardships.unit) LIKE LOWER(:searchTokenWildcard)
            --   )
          )
        )
    )
  `)

  return literal(matchingEntries)
}

export default datasetsSearch
