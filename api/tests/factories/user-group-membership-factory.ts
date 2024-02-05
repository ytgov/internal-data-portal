import { UserGroupMembership } from "@/models"

import BaseFactory from "@/factories/base-factory"

export const userGroupMembershipFactory = BaseFactory.define<UserGroupMembership>(
  ({ sequence, onCreate }) => {
    onCreate((userGroupMembership) => userGroupMembership.save())

    return UserGroupMembership.build({
      id: sequence,
      divisionId: null,
      branchId: null,
      unitId: null,
    })
  }
)

export default userGroupMembershipFactory
