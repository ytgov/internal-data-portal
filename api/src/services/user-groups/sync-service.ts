import { isEmpty } from "lodash"

import acronymize from "@/utils/acronymize"
import { yukonGovernmentIntegration } from "@/integrations"
import { UserGroup } from "@/models"
import { UserGroupTypes } from "@/models/user-groups"
import BaseService from "@/services/base-service"

export const DEFAULT_ORDER = -1

export class SyncService extends BaseService {
  async perform(): Promise<UserGroup[]> {
    try {
      const { divisions: records } = await yukonGovernmentIntegration.fetchDivisions()

      for (const { department, division, branch, unit, order } of records) {
        const isDepartment = division === null && branch === null && unit === null
        const isDivision = branch === null && unit === null
        const isBranch = unit === null

        const departmentName = this.cleanName(department)
        if (isEmpty(departmentName)) continue

        const departmentAcronym = acronymize(departmentName)
        const [userGroup1] = await UserGroup.findOrCreate({
          where: {
            name: departmentName,
            type: UserGroupTypes.DEPARTMENT,
          },
          defaults: {
            name: departmentName,
            acronym: departmentAcronym,
            type: UserGroupTypes.DEPARTMENT,
            order: DEFAULT_ORDER,
          },
        })

        if (isDepartment) {
          await userGroup1.update({ order })
        }

        if (division !== null) {
          const divisionName = this.cleanName(division)
          if (isEmpty(divisionName)) continue

          const divisionAcronym = acronymize(divisionName)
          const [userGroup2] = await UserGroup.findOrCreate({
            where: {
              parentId: userGroup1.id,
              name: divisionName,
              type: UserGroupTypes.DIVISION,
            },
            defaults: {
              parentId: userGroup1.id,
              name: divisionName,
              acronym: divisionAcronym,
              type: UserGroupTypes.DIVISION,
              order: DEFAULT_ORDER,
            },
          })

          if (isDivision) {
            await userGroup2.update({ order })
          }

          if (branch !== null) {
            const branchName = this.cleanName(branch)
            if (isEmpty(branchName)) continue

            const branchAcronym = acronymize(branchName)
            const [userGroup3] = await UserGroup.findOrCreate({
              where: {
                parentId: userGroup2.id,
                name: branchName,
                type: UserGroupTypes.BRANCH,
              },
              defaults: {
                parentId: userGroup2.id,
                name: branchName,
                acronym: branchAcronym,
                type: UserGroupTypes.BRANCH,
                order: DEFAULT_ORDER,
              },
            })

            if (isBranch) {
              await userGroup3.update({ order })
            }

            if (unit !== null) {
              const unitName = this.cleanName(unit)
              if (isEmpty(unitName)) continue

              const unitAcronym = acronymize(unitName)
              await UserGroup.findOrCreate({
                where: {
                  parentId: userGroup3.id,
                  name: unitName,
                  type: UserGroupTypes.UNIT,
                },
                defaults: {
                  parentId: userGroup3.id,
                  name: unitName,
                  acronym: unitAcronym,
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

  private cleanName(name: string) {
    return name.trim().replace(/\s+/g, " ")
  }
}

export default SyncService
