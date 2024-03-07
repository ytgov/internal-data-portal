import { isEmpty, isNil } from "lodash"

import db, { Role, User, UserGroup, UserGroupMembership } from "@/models"

import { Users, UserGroups } from "@/services"
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

    const randomUserGroup = await UserGroup.findOne({
      order: db.random(),
    })

    if (!isNil(randomUserGroup)) {
      return this.establishGroupMembership(user, randomUserGroup)
    }

    await UserGroups.YukonGovernmentDirectorySyncService.perform()

    const randomUserGroupTake2 = await UserGroup.findOne({
      order: db.random(),
    })
    if (isNil(randomUserGroupTake2)) {
      throw new Error("No user groups found")
    }

    return this.establishGroupMembership(user, randomUserGroupTake2)
  }

  private async establishGroupMembership(user: User, userGroup: UserGroup) {
    if (userGroup.type === UserGroup.Types.DEPARTMENT) {
      return UserGroupMembership.create({
        userId: user.id,
        departmentId: userGroup.id,
      })
    }

    if (userGroup.type === UserGroup.Types.DIVISION) {
      const department = await userGroup.getParent()

      return UserGroupMembership.create({
        userId: user.id,
        departmentId: department?.id,
        divisionId: userGroup.id,
      })
    }

    if (userGroup.type === UserGroup.Types.BRANCH) {
      const division = await userGroup.getParent()
      const department = await division?.getParent()

      return UserGroupMembership.create({
        userId: user.id,
        departmentId: department?.id,
        divisionId: division?.id,
        branchId: userGroup.id,
      })
    }

    const branch = await userGroup.getParent()
    const division = await branch?.getParent()
    const department = await division?.getParent()

    return UserGroupMembership.create({
      userId: user.id,
      departmentId: department?.id,
      divisionId: division?.id,
      branchId: branch?.id,
      unitId: userGroup.id,
    })
  }
}

export default CreateService
