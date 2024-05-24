import { literal } from "sequelize"
import { Literal } from "sequelize/types/utils"

import { compactSql } from "@/utils/compact-sql"
import { JsonDataType } from "@/db/utils/mssql-json-object-types"

/**
 * Requires replacements to be passed in to query.
 * e.g. { replacements: { searchTokenWildcard: `%${searchToken}%`, searchToken }
 */
export function datasetEntryPreviewsSearch(): Literal {
  /**
   * TODO: add ability to inject early filtering,
   * or at least early filtering on dataset_id, as this will vastly speed up the query.
   *
   * See https://learn.microsoft.com/en-us/sql/t-sql/functions/openjson-transact-sql?view=sql-server-ver16#return-value
   */
  const matchingEntries = compactSql(/*sql*/ `
    (
      SELECT
        dataset_entry_previews.id
      FROM
        dataset_entry_previews
        CROSS APPLY OPENJSON(dataset_entry_previews.json_data) AS json_values
      WHERE
        dataset_entry_previews.deleted_at IS NULL
        AND (
          (
            json_values.[type] = ${JsonDataType.STRING}
            AND LOWER(json_values.value) LIKE LOWER(:searchTokenWildcard)
          )
          OR (
            json_values.[type] = ${JsonDataType.NUMBER}
            AND TRY_CAST(json_values.value AS NVARCHAR) = :searchToken
          )
        )
    )
  `)

  return literal(matchingEntries)
}

export default datasetEntryPreviewsSearch
