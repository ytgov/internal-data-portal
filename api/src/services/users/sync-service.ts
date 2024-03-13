import { isNil } from "lodash"

import { User } from "@/models"

import BaseService from "@/services/base-service"
import { yukonGovernmentIntegration } from "@/integrations"
import UserGroup, { UserGroupTypes } from "@/models/user-groups"
import UserGroupMembership from "@/models/user-group-membership"

import { DEFAULT_ORDER } from "@/services/user-groups/sync-service"

export class SyncService extends BaseService {
  private user: User

  constructor(user: User) {
    super()
    this.user = user
  }

  async perform(): Promise<User> {
    const email = this.user.email

    try {
      const employee = await yukonGovernmentIntegration.fetchEmpolyee(email)
      if (isNil(employee)) {
        console.info(`No employee found with email: ${email} in yukon government directory`)
        return this.user.update({
          lastSyncFailureAt: new Date(),
        })
      }

      const { department, division, branch, unit } = employee

      let userGroup2: UserGroup | null = null
      let userGroup3: UserGroup | null = null
      let userGroup4: UserGroup | null = null
      const [userGroup1] = await UserGroup.findOrCreate({
        where: { name: department, type: UserGroupTypes.DEPARTMENT },
        defaults: {
          name: department,
          type: UserGroupTypes.DEPARTMENT,
          order: DEFAULT_ORDER,
        },
      })

      if (userGroup1 && division !== null) {
        userGroup2 = await UserGroup.findOne({
          where: { name: division, type: UserGroupTypes.DIVISION },
        })

        if (userGroup2 && branch !== null) {
          userGroup3 = await UserGroup.findOne({
            where: { name: branch, type: UserGroupTypes.BRANCH },
          })

          if (userGroup3 && unit !== null) {
            userGroup4 = await UserGroup.findOne({
              where: { name: unit, type: UserGroupTypes.UNIT },
            })
          }
        }
      }
      UserGroupMembership.upsert({
        userId: this.user.id,
        departmentId: userGroup1.id,
        divisionId: userGroup2?.id,
        branchId: userGroup3?.id,
        unitId: userGroup4?.id,
      })

      this.user.update({
        lastSyncSuccessAt: new Date(),
        lastSyncFailureAt: null,
      })

      return this.user.reload({
        include: [
          "roles",
          {
            association: "groupMembership",
            include: ["department", "division", "branch", "unit"],
          },
        ],
      })
    } catch (error) {
      console.error(`User sync failure for ${email} with yukon government directory`, error)
      return this.user.update({
        lastSyncFailureAt: new Date(),
      })
    }
  }
}

export default SyncService
