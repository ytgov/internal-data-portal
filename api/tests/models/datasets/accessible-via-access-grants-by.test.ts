import { Dataset } from "@/models"
import { UserGroupTypes } from "@/models/user-groups"
import {
  accessGrantFactory,
  datasetFactory,
  userFactory,
  userGroupFactory,
  userGroupMembershipFactory,
} from "@/factories"
import { AccessTypes, GrantLevels } from "@/models/access-grant"

describe("api/src/models/datasets/accessible-via-access-grants-by.ts", () => {
  describe(".accessibleViaAccessGrantsBy Dataset scope", () => {
    test.each([
      { accessType: AccessTypes.OPEN_ACCESS },
      { accessType: AccessTypes.SELF_SERVE_ACCESS },
      { accessType: AccessTypes.SCREENED_ACCESS },
    ])(
      "when dataset has access grant with government wide `$accessType`, it returns the dataset",
      async ({ accessType }) => {
        // Arrange
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const requestingUserGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const requestingUser = await userFactory
          .transient({
            include: ["groupMembership"],
          })
          .associations({
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
          accessType,
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

        // Act
        const result = await Dataset.scope({
          method: ["accessibleViaAccessGrantsBy", requestingUser],
        }).findAll()

        // Assert
        expect(result).toEqual([
          expect.objectContaining({
            id: accessibleDataset.id,
          }),
        ])
      }
    )

    test("when dataset has no access grants, it does not return the dataset", async () => {
      // Arrange
      const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
      const requestingUserGroupMembership = userGroupMembershipFactory.build({
        departmentId: department.id,
      })
      const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
        departmentId: department.id,
      })
      const requestingUser = await userFactory
        .transient({
          include: ["groupMembership"],
        })
        .associations({
          groupMembership: requestingUserGroupMembership,
        })
        .create()

      const datasetOwner = await userFactory
        .associations({
          groupMembership: datasetOwnerGroupMembership,
        })
        .create()

      await datasetFactory
        .associations({
          accessGrants: [],
        })
        .create({
          creatorId: datasetOwner.id,
          ownerId: datasetOwner.id,
        })

      // Act
      const result = await Dataset.scope({
        method: ["accessibleViaAccessGrantsBy", requestingUser],
      }).findAll()

      // Assert
      expect(result).toEqual([])
    })

    test.each([
      { accessType: AccessTypes.OPEN_ACCESS },
      { accessType: AccessTypes.SELF_SERVE_ACCESS },
      { accessType: AccessTypes.SCREENED_ACCESS },
    ])(
      "when dataset has access grant with department wide `$accessType`, and matching group membership department, returns dataset",
      async ({ accessType }) => {
        // Arrange
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const requestingUserGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const requestingUser = await userFactory
          .transient({
            include: ["groupMembership"],
          })
          .associations({
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
          grantLevel: GrantLevels.DEPARTMENT,
          accessType,
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

        // Act
        const result = await Dataset.scope({
          method: ["accessibleViaAccessGrantsBy", requestingUser],
        }).findAll()

        // Assert
        expect(result).toEqual([
          expect.objectContaining({
            id: accessibleDataset.id,
          }),
        ])
      }
    )

    test.each([
      { accessType: AccessTypes.OPEN_ACCESS },
      { accessType: AccessTypes.SELF_SERVE_ACCESS },
      { accessType: AccessTypes.SCREENED_ACCESS },
    ])(
      "when dataset has access grant with department wide `$accessType`, and non-matching group membership department, returns nothing",
      async ({ accessType }) => {
        // Arrange
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const otherDepartment = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const requestingUserGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
          departmentId: otherDepartment.id,
        })
        const requestingUser = await userFactory
          .transient({
            include: ["groupMembership"],
          })
          .associations({
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
          grantLevel: GrantLevels.DEPARTMENT,
          accessType,
        })
        await datasetFactory
          .associations({
            accessGrants: [accessGrant],
          })
          .create({
            creatorId: datasetOwner.id,
            ownerId: datasetOwner.id,
          })

        // Act
        const result = await Dataset.scope({
          method: ["accessibleViaAccessGrantsBy", requestingUser],
        }).findAll()

        // Assert
        expect(result).toEqual([])
      }
    )

    test.each([
      { accessType: AccessTypes.OPEN_ACCESS },
      { accessType: AccessTypes.SELF_SERVE_ACCESS },
      { accessType: AccessTypes.SCREENED_ACCESS },
    ])(
      "when dataset has access grant with division wide `$accessType`, and matching group membership department and division, returns dataset",
      async ({ accessType }) => {
        // Arrange
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const division = await userGroupFactory.create({ type: UserGroupTypes.DIVISION })
        const requestingUserGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
          divisionId: division.id,
        })
        const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
          divisionId: division.id,
        })
        const requestingUser = await userFactory
          .transient({
            include: ["groupMembership"],
          })
          .associations({
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
          grantLevel: GrantLevels.DIVISION,
          accessType,
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

        // Act
        const result = await Dataset.scope({
          method: ["accessibleViaAccessGrantsBy", requestingUser],
        }).findAll()

        // Assert
        expect(result).toEqual([
          expect.objectContaining({
            id: accessibleDataset.id,
          }),
        ])
      }
    )

    test.each([
      { accessType: AccessTypes.OPEN_ACCESS },
      { accessType: AccessTypes.SELF_SERVE_ACCESS },
      { accessType: AccessTypes.SCREENED_ACCESS },
    ])(
      "when dataset has access grant with division wide `$accessType`, and non-matching group membership division, returns nothing",
      async ({ accessType }) => {
        // Arrange
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const division = await userGroupFactory.create({ type: UserGroupTypes.DIVISION })
        const otherDivision = await userGroupFactory.create({ type: UserGroupTypes.DIVISION })
        const requestingUserGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
          divisionId: division.id,
        })
        const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
          divisionId: otherDivision.id,
        })
        const requestingUser = await userFactory
          .transient({
            include: ["groupMembership"],
          })
          .associations({
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
          grantLevel: GrantLevels.DIVISION,
          accessType,
        })
        await datasetFactory
          .associations({
            accessGrants: [accessGrant],
          })
          .create({
            creatorId: datasetOwner.id,
            ownerId: datasetOwner.id,
          })

        // Act
        const result = await Dataset.scope({
          method: ["accessibleViaAccessGrantsBy", requestingUser],
        }).findAll()

        // Assert
        expect(result).toEqual([])
      }
    )

    test.each([
      { accessType: AccessTypes.OPEN_ACCESS },
      { accessType: AccessTypes.SELF_SERVE_ACCESS },
      { accessType: AccessTypes.SCREENED_ACCESS },
    ])(
      "when dataset has access grant with division wide `$accessType`, and requestor has no division, returns nothing",
      async ({ accessType }) => {
        // Arrange
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const division = await userGroupFactory.create({ type: UserGroupTypes.DIVISION })
        const requestingUserGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
          divisionId: null,
        })
        const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
          divisionId: division.id,
        })
        const requestingUser = await userFactory
          .transient({
            include: ["groupMembership"],
          })
          .associations({
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
          grantLevel: GrantLevels.DIVISION,
          accessType,
        })
        await datasetFactory
          .associations({
            accessGrants: [accessGrant],
          })
          .create({
            creatorId: datasetOwner.id,
            ownerId: datasetOwner.id,
          })

        // Act
        const result = await Dataset.scope({
          method: ["accessibleViaAccessGrantsBy", requestingUser],
        }).findAll()

        // Assert
        expect(result).toEqual([])
      }
    )

    test.each([
      { accessType: AccessTypes.OPEN_ACCESS },
      { accessType: AccessTypes.SELF_SERVE_ACCESS },
      { accessType: AccessTypes.SCREENED_ACCESS },
    ])(
      "when dataset has access grant with branch wide `$accessType`, and matching group membership department, division and branch, returns dataset",
      async ({ accessType }) => {
        // Arrange
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const division = await userGroupFactory.create({ type: UserGroupTypes.DIVISION })
        const branch = await userGroupFactory.create({ type: UserGroupTypes.BRANCH })
        const requestingUserGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
          divisionId: division.id,
          branchId: branch.id,
        })
        const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
          divisionId: division.id,
          branchId: branch.id,
        })
        const requestingUser = await userFactory
          .transient({
            include: ["groupMembership"],
          })
          .associations({
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
          grantLevel: GrantLevels.BRANCH,
          accessType,
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

        // Act
        const result = await Dataset.scope({
          method: ["accessibleViaAccessGrantsBy", requestingUser],
        }).findAll()

        // Assert
        expect(result).toEqual([
          expect.objectContaining({
            id: accessibleDataset.id,
          }),
        ])
      }
    )

    test.each([
      { accessType: AccessTypes.OPEN_ACCESS },
      { accessType: AccessTypes.SELF_SERVE_ACCESS },
      { accessType: AccessTypes.SCREENED_ACCESS },
    ])(
      "when dataset has access grant with branch wide `$accessType`, and non-matching group membership branch, returns nothing",
      async ({ accessType }) => {
        // Arrange
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const division = await userGroupFactory.create({ type: UserGroupTypes.DIVISION })
        const branch = await userGroupFactory.create({ type: UserGroupTypes.BRANCH })
        const otherBranch = await userGroupFactory.create({ type: UserGroupTypes.BRANCH })
        const requestingUserGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
          divisionId: division.id,
          branchId: branch.id,
        })
        const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
          divisionId: division.id,
          branchId: otherBranch.id,
        })
        const requestingUser = await userFactory
          .transient({
            include: ["groupMembership"],
          })
          .associations({
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
          grantLevel: GrantLevels.BRANCH,
          accessType,
        })
        await datasetFactory
          .associations({
            accessGrants: [accessGrant],
          })
          .create({
            creatorId: datasetOwner.id,
            ownerId: datasetOwner.id,
          })

        // Act
        const result = await Dataset.scope({
          method: ["accessibleViaAccessGrantsBy", requestingUser],
        }).findAll()

        // Assert
        expect(result).toEqual([])
      }
    )
  })
})
