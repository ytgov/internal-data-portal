import { AccessTypes, GrantLevels } from "@/models/access-grant"
import { UserGroupTypes } from "@/models/user-groups"

import {
  accessGrantFactory,
  datasetFactory,
  stewardshipEvolutionFactory,
  userFactory,
  userGroupFactory,
  userGroupMembershipFactory,
} from "@/factories"

import { determineAccess } from "@/serializers/datasets/table-helpers"

describe("api/src/serializers/datasets/table/determine-access.ts", () => {
  describe(".determineAccess", () => {
    describe("when datataset has access grant with open access", () => {
      const openAcessType = AccessTypes.OPEN_ACCESS

      test("when grant level is government wide, returns open access", async () => {
        // Arrange
        const requestingUser = await userFactory.create()
        const datasetOwner = await userFactory.create()
        const openAccessGrant = accessGrantFactory.build({
          ownerId: datasetOwner.id,
          grantLevel: GrantLevels.GOVERNMENT_WIDE,
          accessType: openAcessType,
        })
        const dataset = await datasetFactory
          .transient({
            include: ["owner", "accessGrants"],
          })
          .associations({
            accessGrants: [openAccessGrant],
          })
          .create({
            creatorId: datasetOwner.id,
            ownerId: datasetOwner.id,
          })

        // Act
        const result = determineAccess(dataset, requestingUser)

        // Assert
        expect(result).toEqual(AccessTypes.OPEN_ACCESS)
      })

      describe("when grant level is department", () => {
        const departmentGrantLevel = GrantLevels.DEPARTMENT

        test("when user group membership matches access grant owner group membership, returns open access", async () => {
          // Arrange
          const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
          const requestingUserGroupMembership = userGroupMembershipFactory.build({
            departmentId: department.id,
          })
          const requestingUser = await userFactory
            .associations({
              groupMembership: requestingUserGroupMembership,
            })
            .transient({
              include: [
                {
                  association: "groupMembership",
                  include: ["department", "division", "branch", "unit"],
                },
              ],
            })
            .create()
          const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
            departmentId: department.id,
          })
          const datasetOwner = await userFactory
            .associations({
              groupMembership: datasetOwnerGroupMembership,
            })
            .transient({
              include: [
                {
                  association: "groupMembership",
                  include: ["department", "division", "branch", "unit"],
                },
              ],
            })
            .create()
          const openAccessGrant = accessGrantFactory.build({
            ownerId: datasetOwner.id,
            grantLevel: departmentGrantLevel,
            accessType: openAcessType,
          })
          const stewardshipEvolution = stewardshipEvolutionFactory.build({
            ownerId: datasetOwner.id,
            department: requestingUser.department?.name,
          })
          const dataset = await datasetFactory
            .transient({
              include: [
                {
                  association: "owner",
                  include: [
                    {
                      association: "groupMembership",
                      include: ["department", "division", "branch", "unit"],
                    },
                  ],
                },
                "accessGrants",
              ],
            })
            .associations({
              accessGrants: [openAccessGrant],
              stewardshipEvolutions: [stewardshipEvolution],
            })
            .create({
              creatorId: datasetOwner.id,
              ownerId: datasetOwner.id,
            })

          // Act
          const result = determineAccess(dataset, requestingUser)

          // Assert
          expect(result).toEqual(AccessTypes.OPEN_ACCESS)
        })

        test("when user group membership does not match access grant owner group membership, returns no access", async () => {
          // Arrange
          const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
          const otherDepartment = await userGroupFactory.create({
            type: UserGroupTypes.DEPARTMENT,
          })
          const requestingUserGroupMembership = userGroupMembershipFactory.build({
            departmentId: department.id,
          })
          const requestingUser = await userFactory
            .associations({
              groupMembership: requestingUserGroupMembership,
            })
            .transient({
              include: [
                {
                  association: "groupMembership",
                  include: ["department", "division", "branch", "unit"],
                },
              ],
            })
            .create()
          const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
            departmentId: otherDepartment.id,
          })
          const datasetOwner = await userFactory
            .associations({
              groupMembership: datasetOwnerGroupMembership,
            })
            .transient({
              include: [
                {
                  association: "groupMembership",
                  include: ["department", "division", "branch", "unit"],
                },
              ],
            })
            .create()
          const openAccessGrant = accessGrantFactory.build({
            ownerId: datasetOwner.id,
            grantLevel: departmentGrantLevel,
            accessType: openAcessType,
          })
          const stewardshipEvolution = stewardshipEvolutionFactory.build({
            ownerId: datasetOwner.id,
            department: requestingUser.department?.name,
          })
          const dataset = await datasetFactory
            .transient({
              include: [
                {
                  association: "owner",
                  include: [
                    {
                      association: "groupMembership",
                      include: ["department", "division", "branch", "unit"],
                    },
                  ],
                },
                "accessGrants",
              ],
            })
            .associations({
              accessGrants: [openAccessGrant],
              stewardshipEvolutions: [stewardshipEvolution],
            })
            .create({
              creatorId: datasetOwner.id,
              ownerId: datasetOwner.id,
            })

          // Act
          const result = determineAccess(dataset, requestingUser)

          // Assert
          expect(result).toEqual(AccessTypes.NO_ACCESS)
        })
      })
    })
  })
})
