import { literal } from "sequelize"
import { Literal } from "sequelize/types/utils"

import { compactSql } from "@/utils/compact-sql"

export function datasetEntriesSearch(): Literal {
  const query = compactSql(/*sql*/ `
    (
      SELECT
        DISTINCT dataset_entries.id
      FROM
        dataset_entries
        INNER JOIN dataset_fields ON dataset_entries.dataset_id = dataset_fields.dataset_id
        AND dataset_fields.deleted_at IS NULL
        AND dataset_fields.is_excluded_from_search = 0
      WHERE
        dataset_entries.deleted_at IS NULL
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
