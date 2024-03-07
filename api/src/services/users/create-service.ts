import { isEmpty, isNil } from "lodash"

import db, { Role, User, UserGroup, UserGroupMembership } from "@/models"
import { DEFAULT_ORDER } from "@/models/user-groups"

import { Users } from "@/services"
import BaseService from "@/services/base-service"

type GroupMembershipAttributes = Partial<UserGroupMembership>
type Attributes = Partial<User> & {
  groupMembershipAttributes?: GroupMembershipAttributes
}

export class CreateService extends BaseService {
  private attributes: Partial<User>
  private groupMembershipAttributes?: GroupMembershipAttributes

  constructor({ groupMembershipAttributes, ...attributes }: Attributes) {
    super()
    this.attributes = attributes
    this.groupMembershipAttributes = groupMembershipAttributes
  }

  async perform(): Promise<User> {
    const { auth0Subject, email, firstName, lastName, ...optionalAttributes } = this.attributes

    if (isNil(auth0Subject) || isEmpty(auth0Subject)) {
      throw new Error("auth0Subject is required")
    }

    if (isNil(email) || isEmpty(email)) {
      throw new Error("email is required")
    }

    if (isEmpty(firstName)) {
      throw new Error("firstName is required")
    }

    if (isEmpty(lastName)) {
      throw new Error("lastName is required")
    }

    return db.transaction(async () => {
      const user = await User.create({
        auth0Subject,
        email,
        firstName,
        lastName,
        ...optionalAttributes,
      })

      await Role.create({
        userId: user.id,
        role: Role.Types.USER,
      })

      await this.ensureUserGroupMembership(user, this.groupMembershipAttributes)

      return user.reload({
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

  private async ensureUserGroupMembership(
    user: User,
    groupMembershipAttributes?: GroupMembershipAttributes
  ) {
    if (!isEmpty(groupMembershipAttributes)) {
      return UserGroupMembership.create({
        userId: user.id,
        ...groupMembershipAttributes,
      })
    }

    await Users.YukonGovernmentDirectorySyncService.perform(user)

    if (!isEmpty(user.groupMembership)) {
      return user.groupMembership
    }

    const [defaultGroup] = await UserGroup.findOrCreate({
      where: {
        type: UserGroup.Types.DEPARTMENT,
        name: "Unassigned",
      },
      defaults: {
        name: "Unassigned",
        type: UserGroup.Types.DEPARTMENT,
        order: DEFAULT_ORDER,
      },
    })

    return UserGroupMembership.create({
      userId: user.id,
      departmentId: defaultGroup.id,
    })
  }
}

export default CreateService
