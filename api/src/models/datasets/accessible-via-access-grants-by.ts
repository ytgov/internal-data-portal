import { literal } from "sequelize"
import { Literal } from "sequelize/types/utils"
import { isNil } from "lodash"

import { compactSql } from "@/utils/compact-sql"
import User from "@/models/user"

const NON_EXISTENT_ID = -1

// TODO: make this less fragile and more easily testable
export function accessibleViaAccessGrantsBy(user: User): Literal {
  const { groupMembership } = user
  if (isNil(groupMembership)) {
    throw new Error("User must have groupMembership to use accessibleViaAccessGrantsBy")
  }

  const departmentId = groupMembership.departmentId || NON_EXISTENT_ID
  const divisionId = groupMembership.divisionId || NON_EXISTENT_ID
  const branchId = groupMembership.branchId || NON_EXISTENT_ID
  const unitId = groupMembership.unitId || NON_EXISTENT_ID

  const query = compactSql(`
    (
      SELECT DISTINCT
        datasets.id
      FROM
        datasets
      INNER JOIN user_group_memberships AS owner_group_membership ON
        owner_group_membership.deleted_at IS NULL
        AND owner_group_membership.user_id = datasets.owner_id
      INNER JOIN access_grants ON
        access_grants.deleted_at IS NULL
        AND access_grants.dataset_id = datasets.id
      WHERE
        (
          access_grants.access_type IN ('open_access', 'self_serve_access', 'screened_access')
          AND access_grants.grant_level = 'government_wide'
        )
        OR
          (
            access_grants.access_type IN ('open_access', 'self_serve_access', 'screened_access')
            AND access_grants.grant_level = 'department'
            AND owner_group_membership.department_id IS NOT NULL
            AND owner_group_membership.department_id = ${departmentId}
          )
        OR
          (
            access_grants.access_type IN ('open_access', 'self_serve_access', 'screened_access')
            AND access_grants.grant_level = 'division'
            AND owner_group_membership.department_id IS NOT NULL
            AND owner_group_membership.division_id IS NOT NULL
            AND owner_group_membership.department_id = ${departmentId}
            AND owner_group_membership.division_id = ${divisionId}
          )
        OR
          (
            access_grants.access_type IN ('open_access', 'self_serve_access', 'screened_access')
            AND access_grants.grant_level = 'branch'
            AND owner_group_membership.department_id IS NOT NULL
            AND owner_group_membership.division_id IS NOT NULL
            AND owner_group_membership.branch_id IS NOT NULL
            AND owner_group_membership.department_id = ${departmentId}
            AND owner_group_membership.division_id = ${divisionId}
            AND owner_group_membership.branch_id = ${branchId}
          )
        OR
          (
            access_grants.access_type IN ('open_access', 'self_serve_access', 'screened_access')
            AND access_grants.grant_level = 'unit'
            AND owner_group_membership.department_id IS NOT NULL
            AND owner_group_membership.division_id IS NOT NULL
            AND owner_group_membership.branch_id IS NOT NULL
            AND owner_group_membership.unit_id IS NOT NULL
            AND owner_group_membership.department_id = ${departmentId}
            AND owner_group_membership.division_id = ${divisionId}
            AND owner_group_membership.branch_id = ${branchId}
            AND owner_group_membership.unit_id = ${unitId}
          )
    )
  `)

  return literal(query)
}

export default accessibleViaAccessGrantsBy
