import { Dataset } from "@/models"
import { RoleTypes } from "@/models/role"
import { UserGroupTypes } from "@/models/user-groups"
import { AccessTypes, GrantLevels } from "@/models/access-grant"
import { DatasetsPolicy } from "@/policies"
import {
  accessGrantFactory,
  datasetFactory,
  roleFactory,
  userFactory,
  userGroupFactory,
  userGroupMembershipFactory,
} from "@/factories"

describe("api/src/policies/datasets-policy.ts", () => {
  describe("DatasetsPolicy", () => {
    describe(".applyScope", () => {
      test.each([{ roleType: RoleTypes.SYSTEM_ADMIN }, { roleType: RoleTypes.BUSINESS_ANALYST }])(
        "when user role is `$roleType`, it returns the all records",
        async ({ roleType }) => {
          // Arrange
          const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
          const requestingUserGroupMembership = userGroupMembershipFactory.build({
            departmentId: department.id,
          })
          const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
            departmentId: department.id,
          })
          const role = roleFactory.build({ role: roleType })
          const requestinUser = await userFactory
            .transient({
              include: ["groupMembership"],
            })
            .associations({
              roles: [role],
              groupMembership: requestingUserGroupMembership,
            })
            .create()

          const datasetOwner = await userFactory
            .associations({
              groupMembership: datasetOwnerGroupMembership,
            })
            .create()

          const accessibleDataset = await datasetFactory.create({
            creatorId: datasetOwner.id,
            ownerId: datasetOwner.id,
          })
          const scopedQuery = DatasetsPolicy.applyScope(Dataset, requestinUser)

          // Act
          const result = await scopedQuery.findAll()

          // Assert
          expect(result).toEqual([
            expect.objectContaining({
              id: accessibleDataset.id,
            }),
          ])
        }
      )

      test("when user has role type user, and no grants available, returns nothing", async () => {
        // Arrange
        // Arrange
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const requestingUserGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const role = roleFactory.build({ role: RoleTypes.USER })
        const requestinUser = await userFactory
          .transient({
            include: ["groupMembership"],
          })
          .associations({
            roles: [role],
            groupMembership: requestingUserGroupMembership,
          })
          .create()

        const datasetOwner = await userFactory
          .associations({
            groupMembership: datasetOwnerGroupMembership,
          })
          .create()

        await datasetFactory.create({
          creatorId: datasetOwner.id,
          ownerId: datasetOwner.id,
        })
        const scopedQuery = DatasetsPolicy.applyScope(Dataset, requestinUser)

        // Act
        const result = await scopedQuery.findAll()

        // Assert
        expect(Dataset.count()).resolves.toBe(1)
        expect(result).toEqual([])
      })

      test("when user has role type user, and grants available, returns the accessible datasets", async () => {
        // Arrange
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const requestingUserGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const role = roleFactory.build({ role: RoleTypes.USER })
        const requestinUser = await userFactory
          .transient({
            include: ["groupMembership"],
          })
          .associations({
            roles: [role],
            groupMembership: requestingUserGroupMembership,
          })
          .create()

        const datasetOwner = await userFactory
          .associations({
            groupMembership: datasetOwnerGroupMembership,
          })
          .create()

        const accessGrant = accessGrantFactory.build({
          creatorId: datasetOwner.id,
          grantLevel: GrantLevels.GOVERNMENT_WIDE,
          accessType: AccessTypes.OPEN_ACCESS,
        })
        const accessibleDataset = await datasetFactory
          .associations({
            accessGrants: [accessGrant],
          })
          .create({
            creatorId: datasetOwner.id,
            ownerId: datasetOwner.id,
          })
        // inaccessibleDataset - for control case
        await datasetFactory
          .associations({
            accessGrants: [],
          })
          .create({
            creatorId: datasetOwner.id,
            ownerId: datasetOwner.id,
          })
        const scopedQuery = DatasetsPolicy.applyScope(Dataset, requestinUser)

        // Act
        const result = await scopedQuery.findAll()

        // Assert
        expect(Dataset.count()).resolves.toBe(2)
        expect(result).toEqual([
          expect.objectContaining({
            id: accessibleDataset.id,
          }),
        ])
      })

      test("when user has role type data owner, and no grants available, returns the datasets owned by the user", async () => {
        // Arrange
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const requestingUserGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const otherUserGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const role = roleFactory.build({ role: RoleTypes.DATA_OWNER })
        const requestinUser = await userFactory
          .transient({
            include: ["groupMembership"],
          })
          .associations({
            roles: [role],
            groupMembership: requestingUserGroupMembership,
          })
          .create()

        const otherUser = await userFactory
          .associations({
            groupMembership: otherUserGroupMembership,
          })
          .create()

        const ownedDataset = await datasetFactory.create({
          creatorId: requestinUser.id,
          ownerId: requestinUser.id,
        })
        // inaccessibleDataset - for control case
        await datasetFactory.create({
          creatorId: otherUser.id,
          ownerId: otherUser.id,
        })
        const scopedQuery = DatasetsPolicy.applyScope(Dataset, requestinUser)

        // Act
        const result = await scopedQuery.findAll()

        // Assert
        expect(Dataset.count()).resolves.toBe(2)
        expect(result).toEqual([
          expect.objectContaining({
            id: ownedDataset.id,
          }),
        ])
      })

      test("when user has role type data owner, and grants available, returns the datasets owned by the user and the accessible datasets", async () => {
        // Arrange
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const requestingUserGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const otherUserGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const role = roleFactory.build({ role: RoleTypes.DATA_OWNER })
        const requestinUser = await userFactory
          .transient({
            include: ["groupMembership"],
          })
          .associations({
            roles: [role],
            groupMembership: requestingUserGroupMembership,
          })
          .create()

        const otherUser = await userFactory
          .associations({
            groupMembership: otherUserGroupMembership,
          })
          .create()

        const ownedDataset = await datasetFactory.create({
          creatorId: requestinUser.id,
          ownerId: requestinUser.id,
        })
        const accessGrant = accessGrantFactory.build({
          creatorId: otherUser.id,
          grantLevel: GrantLevels.GOVERNMENT_WIDE,
          accessType: AccessTypes.OPEN_ACCESS,
        })
        const accessibleDataset = await datasetFactory
          .associations({
            accessGrants: [accessGrant],
          })
          .create({
            creatorId: otherUser.id,
            ownerId: otherUser.id,
          })
        // inaccessibleDataset - for control case
        await datasetFactory.create({
          creatorId: otherUser.id,
          ownerId: otherUser.id,
        })
        const scopedQuery = DatasetsPolicy.applyScope(Dataset, requestinUser)

        // Act
        const result = await scopedQuery.findAll()

        // Assert
        expect(Dataset.count()).resolves.toBe(3)
        expect(result).toEqual([
          expect.objectContaining({
            id: ownedDataset.id,
          }),
          expect.objectContaining({
            id: accessibleDataset.id,
          }),
        ])
      })
    })
  })
})
