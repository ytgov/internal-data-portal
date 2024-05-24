import { literal } from "sequelize"
import { Literal } from "sequelize/types/utils"

import { compactSql } from "@/utils/compact-sql"

export function datasetsWithFieldExclusionsDisabled(): Literal {
  const query = compactSql(/* sql */ `
    (
      SELECT
        datasets.id
      FROM
        datasets
      INNER JOIN visualization_controls ON
        visualization_controls.dataset_id = datasets.id
        AND datasets.deleted_at IS NULL
        AND visualization_controls.deleted_at IS NULL
      WHERE
        visualization_controls.has_fields_excluded_from_preview = 0
    )
  `)

  return literal(query)
}

export default datasetsWithFieldExclusionsDisabled
