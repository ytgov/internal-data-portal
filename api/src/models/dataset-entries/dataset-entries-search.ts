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
    (
      SELECT
        DISTINCT dataset_entries.id as dataset_entry_id
      FROM
        dataset_entries
        INNER JOIN dataset_fields ON dataset_fields.dataset_id = dataset_entries.dataset_id
        AND dataset_fields.deleted_at IS NULL
      WHERE
        dataset_entries.deleted_at IS NULL
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
    )
  `)

  return literal(searchResultsQuery)
}

export default datasetEntriesSearch
