import { literal } from "sequelize"
import { Literal } from "sequelize/types/utils"

import { compactSql } from "@/utils/compact-sql"

/**
 * Requires replacements to be passed in to query.
 * e.g. { replacements: { searchTokenWildcard: `%${searchToken}%`, searchToken }
 */
export function datasetEntriesSearch(): Literal {
  /**
   * Only applies search field exclusions when enabled.
   */
  const query = compactSql(/*sql*/ `
    (
      SELECT
        DISTINCT dataset_entries.id
      FROM
        dataset_entries
      INNER JOIN dataset_fields ON dataset_fields.dataset_id = dataset_entries.dataset_id
        AND dataset_fields.deleted_at IS NULL
      INNER JOIN visualization_controls ON visualization_controls.dataset_id = dataset_entries.dataset_id
        AND visualization_controls.deleted_at IS NULL
      WHERE
        dataset_entries.deleted_at IS NULL
        AND (
          (
            visualization_controls.has_search_customizations = 1
            AND visualization_controls.has_fields_excluded_from_search = 1
            AND dataset_fields.is_excluded_from_search = 0
          )
          OR (
            visualization_controls.has_search_customizations = 1
            AND visualization_controls.has_fields_excluded_from_search = 0
          )
          OR visualization_controls.has_search_customizations = 0
        )
        AND (
          (
            dataset_fields.data_type = 'text'
            AND LOWER(
              JSON_VALUE(
                dataset_entries.json_data,
                CONCAT('$.', dataset_fields.name)
              )
            ) LIKE LOWER(:searchTokenWildcard)
          )
          OR (
            dataset_fields.data_type = 'integer'
            AND TRY_CAST(
              JSON_VALUE(
                dataset_entries.json_data,
                CONCAT('$.', dataset_fields.name)
              ) AS NVARCHAR
            ) = :searchToken
          )
        )
    )
  `)

  return literal(query)
}

export default datasetEntriesSearch
