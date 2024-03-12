import { isEmpty, isUndefined } from "lodash"

import db, { User, UserGroupMembership } from "@/models"

import BaseService from "@/services/base-service"

type GroupMembershipAttributes = Pick<
  UserGroupMembership,
  "departmentId" | "divisionId" | "branchId" | "unitId"
>
type Attributes = Partial<User> & {
  groupMembershipAttributes?: GroupMembershipAttributes
}

export class UpdateService extends BaseService {
  constructor(
    protected user: User,
    protected attributes: Attributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<User> {
    const { groupMembership } = this.user
    if (isUndefined(groupMembership)) {
      throw new Error("Expected user to have group membership association.")
    }

    return db.transaction(async () => {
      await this.user.update(this.attributes)

      const { groupMembershipAttributes } = this.attributes
      if (!isEmpty(groupMembershipAttributes)) {
        await groupMembership.update(groupMembershipAttributes)
      }

      // TODO: log user action

      return this.user.reload({
        include: [
          "roles",
          {
            association: "groupMembership",
            include: ["department", "division", "branch", "unit"],
          },
        ],
      })
    })
  }
}

export default UpdateService
