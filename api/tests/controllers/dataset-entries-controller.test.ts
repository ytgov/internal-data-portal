import { RoleTypes } from "@/models/role"
import { DatasetField } from "@/models"

import {
  accessGrantFactory,
  datasetEntryFactory,
  datasetFactory,
  datasetFieldFactory,
  roleFactory,
  userFactory,
  userGroupFactory,
  userGroupMembershipFactory,
  visualizationControlFactory,
} from "@/factories"

import { mockCurrentUser, request } from "@/support"
import { UserGroupTypes } from "@/models/user-groups"
import { AccessTypes, GrantLevels } from "@/models/access-grant"

describe("api/src/controllers/dataset-entries-controller.ts", () => {
  describe("DatasetEntriesController", () => {
    describe("#index", () => {
      test("when open access, and filter applied, limits by filter", async () => {
        // Arrange
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const currentUserGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const userRole = roleFactory.build({ role: RoleTypes.USER })
        const currentUser = await userFactory
          .associations({
            roles: [userRole],
            groupMembership: currentUserGroupMembership,
          })
          .transient({
            include: ["roles", "groupMembership"],
          })
          .create()
        mockCurrentUser(currentUser)

        const dataOwner = await userFactory
          .associations({
            groupMembership: datasetOwnerGroupMembership,
          })
          .create()
        const accessGrant = accessGrantFactory.build({
          creatorId: dataOwner.id,
          grantLevel: GrantLevels.GOVERNMENT_WIDE,
          accessType: AccessTypes.OPEN_ACCESS,
        })
        const dataset = await datasetFactory
          .associations({
            accessGrants: [accessGrant],
          })
          .create({
            creatorId: dataOwner.id,
            ownerId: dataOwner.id,
          })
        await visualizationControlFactory.create({
          datasetId: dataset.id,
        })
        await datasetFieldFactory.create({
          datasetId: dataset.id,
          name: "email",
          dataType: DatasetField.DataTypes.TEXT,
        })
        const datasetEntry1 = await datasetEntryFactory.create({
          datasetId: dataset.id,
          jsonData: { email: "Marlen@test.com" },
        })
        const datasetEntry2 = await datasetEntryFactory.create({
          datasetId: dataset.id,
          jsonData: { email: "Mark@test.com" },
        })
        await datasetEntryFactory.create({
          datasetId: dataset.id,
          jsonData: { email: "Mandy@test.com" },
        })

        // Act
        const response = await request()
          .get("/api/dataset-entries")
          .query({
            filters: {
              search: "mar",
            },
          })

        // Assert
        expect.assertions(2)
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          datasetEntries: [
            expect.objectContaining({
              id: datasetEntry1.id,
              jsonData: { email: "Marlen@test.com" },
            }),
            expect.objectContaining({
              id: datasetEntry2.id,
              jsonData: { email: "Mark@test.com" },
            }),
          ],
          totalCount: 2,
        })
      })

      test("when screened access, and filter is applied, limits all access", async () => {
        // Arrange
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const currentUserGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const userRole = roleFactory.build({ role: RoleTypes.USER })
        const currentUser = await userFactory
          .associations({
            roles: [userRole],
            groupMembership: currentUserGroupMembership,
          })
          .transient({
            include: ["roles", "groupMembership"],
          })
          .create()
        mockCurrentUser(currentUser)

        const dataOwner = await userFactory
          .associations({
            groupMembership: datasetOwnerGroupMembership,
          })
          .create()
        const accessGrant = accessGrantFactory.build({
          creatorId: dataOwner.id,
          grantLevel: GrantLevels.GOVERNMENT_WIDE,
          accessType: AccessTypes.SCREENED_ACCESS,
        })
        const dataset = await datasetFactory
          .associations({
            accessGrants: [accessGrant],
          })
          .create({
            creatorId: dataOwner.id,
            ownerId: dataOwner.id,
          })
        await visualizationControlFactory.create({
          datasetId: dataset.id,
        })
        await datasetFieldFactory.create({
          datasetId: dataset.id,
          name: "email",
          dataType: DatasetField.DataTypes.TEXT,
        })
        await datasetEntryFactory.create({
          datasetId: dataset.id,
          jsonData: { email: "Marlen@test.com" },
        })
        await datasetEntryFactory.create({
          datasetId: dataset.id,
          jsonData: { email: "Mark@test.com" },
        })
        await datasetEntryFactory.create({
          datasetId: dataset.id,
          jsonData: { email: "Mandy@test.com" },
        })

        // Act
        const response = await request()
          .get("/api/dataset-entries")
          .query({
            filters: {
              search: "mar",
            },
          })

        // Assert
        expect.assertions(2)
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          datasetEntries: [],
          totalCount: 0,
        })
      })

      test("when some open access and some screened access, and filter applied, limits by filter and by access", async () => {
        // Arrange
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const currentUserGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const userRole = roleFactory.build({ role: RoleTypes.USER })
        const currentUser = await userFactory
          .associations({
            roles: [userRole],
            groupMembership: currentUserGroupMembership,
          })
          .transient({
            include: ["roles", "groupMembership"],
          })
          .create()
        mockCurrentUser(currentUser)

        const dataOwner = await userFactory
          .associations({
            groupMembership: datasetOwnerGroupMembership,
          })
          .create()
        const openAccessGrant = accessGrantFactory.build({
          creatorId: dataOwner.id,
          grantLevel: GrantLevels.GOVERNMENT_WIDE,
          accessType: AccessTypes.OPEN_ACCESS,
        })

        const accessibleDataset = await datasetFactory
          .associations({
            accessGrants: [openAccessGrant],
          })
          .create({
            creatorId: dataOwner.id,
            ownerId: dataOwner.id,
          })
        await visualizationControlFactory.create({
          datasetId: accessibleDataset.id,
        })
        await datasetFieldFactory.create({
          datasetId: accessibleDataset.id,
          name: "email",
          dataType: DatasetField.DataTypes.TEXT,
        })
        const datasetEntry1 = await datasetEntryFactory.create({
          datasetId: accessibleDataset.id,
          jsonData: { email: "Marlen@test.com" },
        })
        const datasetEntry2 = await datasetEntryFactory.create({
          datasetId: accessibleDataset.id,
          jsonData: { email: "Mark@test.com" },
        })
        await datasetEntryFactory.create({
          datasetId: accessibleDataset.id,
          jsonData: { email: "Mandy@test.com" },
        })

        const screenedAccessGrant = accessGrantFactory.build({
          creatorId: dataOwner.id,
          grantLevel: GrantLevels.GOVERNMENT_WIDE,
          accessType: AccessTypes.SCREENED_ACCESS,
        })
        const inaccessibleDataset = await datasetFactory
          .associations({
            accessGrants: [screenedAccessGrant],
          })
          .create({
            creatorId: dataOwner.id,
            ownerId: dataOwner.id,
          })
        await visualizationControlFactory.create({
          datasetId: inaccessibleDataset.id,
        })
        await datasetFieldFactory.create({
          datasetId: inaccessibleDataset.id,
          name: "email",
          dataType: DatasetField.DataTypes.TEXT,
        })
        await datasetEntryFactory.create({
          datasetId: inaccessibleDataset.id,
          jsonData: { email: "Marlen@test.com" },
        })
        await datasetEntryFactory.create({
          datasetId: inaccessibleDataset.id,
          jsonData: { email: "Mark@test.com" },
        })
        await datasetEntryFactory.create({
          datasetId: inaccessibleDataset.id,
          jsonData: { email: "Mandy@test.com" },
        })

        // Act
        const response = await request()
          .get("/api/dataset-entries")
          .query({
            filters: {
              search: "mar",
            },
          })

        // Assert
        expect.assertions(2)
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          datasetEntries: [
            expect.objectContaining({
              id: datasetEntry1.id,
              jsonData: { email: "Marlen@test.com" },
            }),
            expect.objectContaining({
              id: datasetEntry2.id,
              jsonData: { email: "Mark@test.com" },
            }),
          ],
          totalCount: 2,
        })
      })
    })
  })
})
