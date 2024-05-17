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
   *
   * TODO: add ability to inject early filtering,
   * or at least early filtering on dataset_id, as this will vastly speed up the query.
   */
  const searchResultsQuery = compactSql(/*sql*/ `
    SELECT
      DISTINCT dataset_entries.id as dataset_entry_id,
      dataset_entries.dataset_id
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
          visualization_controls.has_preview_customizations = 1
          AND visualization_controls.has_fields_excluded_from_preview = 1
          AND dataset_fields.is_excluded_from_preview = 0
        )
        OR (
          visualization_controls.has_preview_customizations = 1
          AND visualization_controls.has_fields_excluded_from_preview = 0
        )
        OR visualization_controls.has_preview_customizations = 0
      )
      AND (
        (
          dataset_fields.data_type = 'text'
          AND LOWER(
            JSON_VALUE(
              dataset_entries.json_data,
              CONCAT('$."', dataset_fields.name, '"')
            )
          ) LIKE LOWER(:searchTokenWildcard)
        )
        OR (
          dataset_fields.data_type = 'integer'
          AND TRY_CAST(
            JSON_VALUE(
              dataset_entries.json_data,
              CONCAT('$."', dataset_fields.name, '"')
            ) AS NVARCHAR
          ) = :searchToken
        )
      )
  `)

  /**
   * Must deduplicate search results before adding row numbers for result limiting
   * or results will be lost.
   */
  const numberedSearchResultsQuery = compactSql(/*sql*/ `
    SELECT
      dataset_entry_id,
      dataset_id,
      ROW_NUMBER() OVER(
        PARTITION BY dataset_id
        ORDER BY dataset_entry_id
      ) AS search_result_number
    FROM
      (${searchResultsQuery}) as search_results
  `)

  /**
   * Only applies search row limits when enabled.
   */
  const query = compactSql(/*sql*/ `
    (
      SELECT
        dataset_entry_id
      FROM
        (${numberedSearchResultsQuery}) as numbered_search_results
      INNER JOIN visualization_controls ON visualization_controls.dataset_id = numbered_search_results.dataset_id
        AND visualization_controls.deleted_at IS NULL
      WHERE
        (
          visualization_controls.has_preview_customizations = 1
          AND visualization_controls.has_preview_row_limit = 1
          AND numbered_search_results.search_result_number <= visualization_controls.preview_row_limit
        )
        OR (
          visualization_controls.has_preview_customizations = 1
          AND visualization_controls.has_preview_row_limit = 1
          AND visualization_controls.preview_row_limit IS NULL
        )
        OR (
          visualization_controls.has_preview_customizations = 1
          AND visualization_controls.has_preview_row_limit = 0
        )
        OR visualization_controls.has_preview_customizations = 0
    )
  `)

  return literal(query)
}

export default datasetEntriesSearch
