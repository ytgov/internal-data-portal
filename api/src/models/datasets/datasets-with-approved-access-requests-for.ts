import { literal } from "sequelize"
import { Literal } from "sequelize/types/utils"

import { compactSql } from "@/utils/compact-sql"
import User from "@/models/user"

export function datasetsWithApprovedAccessRequestsFor(user: User): Literal {
  const query = compactSql(/* sql */ `
    (
      SELECT
        datasets.id
      FROM
        datasets
      INNER JOIN access_requests ON
        access_requests.deleted_at IS NULL
        AND access_requests.dataset_id = datasets.id
      WHERE
        access_requests.requestor_id = ${user.id}
        AND access_requests.approved_at IS NOT NULL
    )
  `)

  return literal(query)
}

export default datasetsWithApprovedAccessRequestsFor
