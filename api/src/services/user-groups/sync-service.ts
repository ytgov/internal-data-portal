import { UserGroup } from "@/models"

import BaseService from "@/services/base-service"
import { yukonGovernmentIntegration } from "@/integrations"
import { UserGroupTypes } from "@/models/user-groups"

export const DEFAULT_ORDER = -1

export class SyncService extends BaseService {
  async perform(): Promise<UserGroup[]> {
    try {
      const { divisions: records } = await yukonGovernmentIntegration.fetchDivisions()

      for (const { department, division, branch, unit, order } of records) {
        const isDepartment = division === null && branch === null && unit === null
        const isDivision = branch === null && unit === null
        const isBranch = unit === null

        const [userGroup1] = await UserGroup.findOrCreate({
          where: {
            name: department,
            type: UserGroupTypes.DEPARTMENT,
          },
          defaults: {
            name: department,
            type: UserGroupTypes.DEPARTMENT,
            order: DEFAULT_ORDER,
          },
        })

        if (isDepartment) {
          await userGroup1.update({ order })
        }

        if (division !== null) {
          const [userGroup2] = await UserGroup.findOrCreate({
            where: {
              parentId: userGroup1.id,
              name: division,
              type: UserGroupTypes.DIVISION,
            },
            defaults: {
              parentId: userGroup1.id,
              name: division,
              type: UserGroupTypes.DIVISION,
              order: DEFAULT_ORDER,
            },
          })

          if (isDivision) {
            await userGroup2.update({ order })
          }

          if (branch !== null) {
            const [userGroup3] = await UserGroup.findOrCreate({
              where: {
                parentId: userGroup2.id,
                name: branch,
                type: UserGroupTypes.BRANCH,
              },
              defaults: {
                parentId: userGroup2.id,
                name: branch,
                type: UserGroupTypes.BRANCH,
                order: DEFAULT_ORDER,
              },
            })

            if (isBranch) {
              await userGroup3.update({ order })
            }

            if (unit !== null) {
              await UserGroup.findOrCreate({
                where: {
                  parentId: userGroup3.id,
                  name: unit,
                  type: UserGroupTypes.UNIT,
                },
                defaults: {
                  parentId: userGroup3.id,
                  name: unit,
                  type: UserGroupTypes.UNIT,
                  order,
                },
              })
            }
          }
        }
      }

      return UserGroup.findAll({
        include: [
          {
            association: "children",
            include: [
              {
                association: "children",
                include: [
                  {
                    association: "children",
                    include: ["children"],
                  },
                ],
              },
            ],
          },
        ],
      })
    } catch (error) {
      console.log("Failed to sync with yukon government directory", error)
      await UserGroup.update(
        { lastDivisionDirectorySyncAt: new Date() },
        { where: {} } // Empty condition, meaning update all rows
      )

      return UserGroup.findAll()
    }
  }
}

export default SyncService
