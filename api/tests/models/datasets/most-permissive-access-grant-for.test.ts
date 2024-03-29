import { faker } from "@faker-js/faker"

import { AccessTypes, GrantLevels } from "@/models/access-grant"
import { UserGroupTypes } from "@/models/user-groups"

import {
  accessGrantFactory,
  datasetFactory,
  userFactory,
  userGroupFactory,
  userGroupMembershipFactory,
} from "@/factories"

describe("api/src/models/datasets/most-permissive-access-grant-for.ts", () => {
  describe("Dataset#mostPermissiveAccessGrantFor", () => {
    describe("when datataset has access grant with open access", () => {
      test("when grant level is government wide, returns access grant with open access", async () => {
        // Arrange
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const otherDepartment = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
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
          .create()
        const openAccessGrant = accessGrantFactory.build({
          creatorId: datasetOwner.id,
          grantLevel: GrantLevels.GOVERNMENT_WIDE,
          accessType: AccessTypes.OPEN_ACCESS,
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
          })
          .create({
            creatorId: datasetOwner.id,
            ownerId: datasetOwner.id,
          })

        // Act
        const result = dataset.mostPermissiveAccessGrantFor(requestingUser)

        // Assert
        expect(result).toEqual(
          expect.objectContaining({
            accessType: AccessTypes.OPEN_ACCESS,
          })
        )
      })

      describe("when grant level is department", () => {
        test("when user group membership matches access grant owner group membership, returns access grant with open access", async () => {
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
            .create()
          const openAccessGrant = accessGrantFactory.build({
            creatorId: datasetOwner.id,
            grantLevel: GrantLevels.DEPARTMENT,
            accessType: AccessTypes.OPEN_ACCESS,
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
            })
            .create({
              creatorId: datasetOwner.id,
              ownerId: datasetOwner.id,
            })

          // Act
          const result = dataset.mostPermissiveAccessGrantFor(requestingUser)

          // Assert
          expect(result).toEqual(
            expect.objectContaining({
              accessType: AccessTypes.OPEN_ACCESS,
            })
          )
        })

        test("when user group membership does not match access grant owner group membership, returns null", async () => {
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
            .create()
          const openAccessGrant = accessGrantFactory.build({
            creatorId: datasetOwner.id,
            grantLevel: GrantLevels.DEPARTMENT,
            accessType: AccessTypes.OPEN_ACCESS,
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
            })
            .create({
              creatorId: datasetOwner.id,
              ownerId: datasetOwner.id,
            })

          // Act
          const result = dataset.mostPermissiveAccessGrantFor(requestingUser)

          // Assert
          expect(result).toEqual(null)
        })
      })

      describe("when grant level is division", () => {
        test("when user group membership matches access grant owner group membership, returns access grant with open access", async () => {
          // Arrange
          const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
          const division = await userGroupFactory.create({ type: UserGroupTypes.DIVISION })
          const requestingUserGroupMembership = userGroupMembershipFactory.build({
            departmentId: department.id,
            divisionId: division.id,
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
            divisionId: division.id,
          })
          const datasetOwner = await userFactory
            .associations({
              groupMembership: datasetOwnerGroupMembership,
            })
            .create()
          const openAccessGrant = accessGrantFactory.build({
            creatorId: datasetOwner.id,
            grantLevel: GrantLevels.DIVISION,
            accessType: AccessTypes.OPEN_ACCESS,
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
            })
            .create({
              creatorId: datasetOwner.id,
              ownerId: datasetOwner.id,
            })

          // Act
          const result = dataset.mostPermissiveAccessGrantFor(requestingUser)

          // Assert
          expect(result).toEqual(
            expect.objectContaining({
              accessType: AccessTypes.OPEN_ACCESS,
            })
          )
        })

        test("when user group membership division does not matches access grant owner group membership, returns access grant with open access", async () => {
          // Arrange
          const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
          const division = await userGroupFactory.create({ type: UserGroupTypes.DIVISION })
          const otherDivision = await userGroupFactory.create({ type: UserGroupTypes.DIVISION })
          const requestingUserGroupMembership = userGroupMembershipFactory.build({
            departmentId: department.id,
            divisionId: division.id,
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
            divisionId: otherDivision.id,
          })
          const datasetOwner = await userFactory
            .associations({
              groupMembership: datasetOwnerGroupMembership,
            })
            .create()
          const openAccessGrant = accessGrantFactory.build({
            creatorId: datasetOwner.id,
            grantLevel: GrantLevels.DIVISION,
            accessType: AccessTypes.OPEN_ACCESS,
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
            })
            .create({
              creatorId: datasetOwner.id,
              ownerId: datasetOwner.id,
            })

          // Act
          const result = dataset.mostPermissiveAccessGrantFor(requestingUser)

          // Assert
          expect(result).toEqual(null)
        })

        test("when user group membership department does not match access grant owner group membership, returns null", async () => {
          // Arrange
          const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
          const otherDepartment = await userGroupFactory.create({
            type: UserGroupTypes.DEPARTMENT,
          })
          const division = await userGroupFactory.create({ type: UserGroupTypes.DIVISION })
          const requestingUserGroupMembership = userGroupMembershipFactory.build({
            departmentId: department.id,
            divisionId: division.id,
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
            divisionId: division.id,
          })
          const datasetOwner = await userFactory
            .associations({
              groupMembership: datasetOwnerGroupMembership,
            })
            .create()
          const openAccessGrant = accessGrantFactory.build({
            creatorId: datasetOwner.id,
            grantLevel: GrantLevels.DEPARTMENT,
            accessType: AccessTypes.OPEN_ACCESS,
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
            })
            .create({
              creatorId: datasetOwner.id,
              ownerId: datasetOwner.id,
            })

          // Act
          const result = dataset.mostPermissiveAccessGrantFor(requestingUser)

          // Assert
          expect(result).toEqual(null)
        })
      })
    })

    describe("when datataset has access grant with self-serve access", () => {
      test("when only access grant level is government wide, returns access grant with self-serve access", async () => {
        // Arrange
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const otherDepartment = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
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
          .create()
        const selfServeAccessGrant = accessGrantFactory.build({
          creatorId: datasetOwner.id,
          grantLevel: GrantLevels.GOVERNMENT_WIDE,
          accessType: AccessTypes.SELF_SERVE_ACCESS,
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
            accessGrants: [selfServeAccessGrant],
          })
          .create({
            creatorId: datasetOwner.id,
            ownerId: datasetOwner.id,
          })

        // Act
        const result = dataset.mostPermissiveAccessGrantFor(requestingUser)

        // Assert
        expect(result).toEqual(
          expect.objectContaining({
            accessType: AccessTypes.SELF_SERVE_ACCESS,
          })
        )
      })

      test("when access types of open and self-serve access exist with grant levels government wide, prefers access grant with open access", async () => {
        // Arrange
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const otherDepartment = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
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
          .create()
        const openAccessGrant = accessGrantFactory.build({
          creatorId: datasetOwner.id,
          grantLevel: GrantLevels.GOVERNMENT_WIDE,
          accessType: AccessTypes.OPEN_ACCESS,
        })
        const selfServeAccessGrant = accessGrantFactory.build({
          creatorId: datasetOwner.id,
          grantLevel: GrantLevels.GOVERNMENT_WIDE,
          accessType: AccessTypes.SELF_SERVE_ACCESS,
        })
        const accessGrants = faker.helpers.shuffle([selfServeAccessGrant, openAccessGrant])
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
            accessGrants,
          })
          .create({
            creatorId: datasetOwner.id,
            ownerId: datasetOwner.id,
          })

        // Act
        const result = dataset.mostPermissiveAccessGrantFor(requestingUser)

        // Assert
        expect(result).toEqual(
          expect.objectContaining({
            accessType: AccessTypes.OPEN_ACCESS,
          })
        )
      })

      test("when access types of self-serve and screened access exist with grant levels government wide, prefers access grant with self-serve access", async () => {
        // Arrange
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const otherDepartment = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
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
          .create()
        const selfServeAccessGrant = accessGrantFactory.build({
          creatorId: datasetOwner.id,
          grantLevel: GrantLevels.GOVERNMENT_WIDE,
          accessType: AccessTypes.SELF_SERVE_ACCESS,
        })
        const screenedAccessGrant = accessGrantFactory.build({
          creatorId: datasetOwner.id,
          grantLevel: GrantLevels.GOVERNMENT_WIDE,
          accessType: AccessTypes.SCREENED_ACCESS,
        })
        const accessGrants = faker.helpers.shuffle([screenedAccessGrant, selfServeAccessGrant])
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
            accessGrants,
          })
          .create({
            creatorId: datasetOwner.id,
            ownerId: datasetOwner.id,
          })

        // Act
        const result = dataset.mostPermissiveAccessGrantFor(requestingUser)

        // Assert
        expect(result).toEqual(
          expect.objectContaining({
            accessType: AccessTypes.SELF_SERVE_ACCESS,
          })
        )
      })
    })
  })
})
