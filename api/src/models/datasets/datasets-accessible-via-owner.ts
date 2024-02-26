import { literal } from "sequelize"
import { Literal } from "sequelize/types/utils"

import { compactSql } from "@/utils/compact-sql"
import User from "@/models/user"

export function datasetsAccessibleViaOwner(user: User): Literal {
  const query = compactSql(/* sql */ `
    (
      SELECT
        datasets.id
      FROM
        datasets
      WHERE datasets.owner_id = ${user.id}
    )
  `)

  return literal(query)
}

export default datasetsAccessibleViaOwner
