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
        DISTINCT search_results.dataset_entry_id
      FROM
        (
          SELECT
            dataset_entries.id as dataset_entry_id,
            visualization_controls.has_search_customizations,
            visualization_controls.has_search_row_limits,
            visualization_controls.search_row_limit_maximum,
            ROW_NUMBER() OVER(
              PARTITION BY dataset_entries.dataset_id
              ORDER BY
                dataset_entries.id
            ) AS row_number
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
        ) as search_results
      WHERE
        (
          search_results.has_search_customizations = 1
          AND search_results.has_search_row_limits = 1
          AND search_results.row_number <= search_results.search_row_limit_maximum
        )
        OR (
          search_results.has_search_customizations = 1
          AND search_results.has_search_row_limits = 1
          AND search_results.search_row_limit_maximum IS NULL
        )
        OR (
          search_results.has_search_customizations = 1
          AND search_results.has_search_row_limits = 0
        )
        OR search_results.has_search_customizations = 0
    )
  `)

  return literal(query)
}

export default datasetEntriesSearch
