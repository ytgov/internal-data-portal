import { isEmpty, isNil } from "lodash"

import db, { Role, User, UserGroup, UserGroupMembership } from "@/models"
import { DEFAULT_ORDER, UNASSIGNED_USER_GROUP_NAME } from "@/models/user-groups"

import { SyncService } from "@/services/users"
import BaseService from "@/services/base-service"

type RolesAttributes = Partial<Role>[]
type GroupMembershipAttributes = Partial<UserGroupMembership>
type UserCreationAttributes = Partial<User> & {
  groupMembershipAttributes?: GroupMembershipAttributes
  rolesAttributes?: RolesAttributes
}

export class CreateService extends BaseService {
  private attributes: Partial<User>
  private groupMembershipAttributes?: GroupMembershipAttributes
  private rolesAttributes?: RolesAttributes
  private currentUser?: User | undefined

  constructor(
    { groupMembershipAttributes, rolesAttributes, ...attributes }: UserCreationAttributes,
    currentUser?: User
  ) {
    super()
    this.attributes = attributes
    this.groupMembershipAttributes = groupMembershipAttributes
    this.rolesAttributes = rolesAttributes
    this.currentUser = currentUser
  }

  async perform(): Promise<User> {
    const {
      auth0Subject,
      email,
      setupFromEmailFirstLogin,
      firstName,
      lastName,
      ...optionalAttributes
    } = this.attributes

    if (setupFromEmailFirstLogin && !isEmpty(auth0Subject)) {
      throw new Error("auth0Subject is not allowed when setupFromEmailFirstLogin is true")
    }

    if (isEmpty(auth0Subject) && !setupFromEmailFirstLogin) {
      throw new Error("auth0Subject is required when setupFromEmailFirstLogin is falsey")
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
        setupFromEmailFirstLogin,
        ...optionalAttributes,
      })

      await this.ensureRoles(user, this.rolesAttributes)
      await this.ensureUserGroupMembership(user, this.groupMembershipAttributes)

      // Log user action, if available

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

  private async ensureRoles(user: User, rolesAttributes?: RolesAttributes) {
    const defaultRole = { role: Role.Types.USER, userId: user.id }
    const secureRolesAttributes = rolesAttributes?.map((roleAttributes) => ({
      userId: user.id,
      role: Role.Types.USER,
      ...roleAttributes,
    })) || [defaultRole]

    return Role.bulkCreate(secureRolesAttributes)
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

    await SyncService.perform(user)

    if (!isEmpty(user.groupMembership)) {
      return user.groupMembership
    }

    const [defaultGroup] = await UserGroup.findOrCreate({
      where: {
        type: UserGroup.Types.DEPARTMENT,
        name: UNASSIGNED_USER_GROUP_NAME,
      },
      defaults: {
        name: UNASSIGNED_USER_GROUP_NAME,
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
