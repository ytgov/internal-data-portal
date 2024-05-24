import { RoleTypes } from "@/models/role"
import { DatasetEntry } from "@/models"
import { DatasetEntriesPolicy } from "@/policies"
import {
  accessGrantFactory,
  accessRequestFactory,
  datasetEntryFactory,
  datasetFactory,
  roleFactory,
  userFactory,
  userGroupFactory,
  userGroupMembershipFactory,
} from "@/factories"
import { UserGroupTypes } from "@/models/user-groups"
import { AccessTypes, GrantLevels } from "@/models/access-grant"

describe("api/src/policies/dataset-entries-policy.ts", () => {
  describe("DatasetEntryPreviewsPolicy", () => {
    describe(".applyScope", () => {
      test.each([{ roleType: RoleTypes.SYSTEM_ADMIN }, { roleType: RoleTypes.BUSINESS_ANALYST }])(
        "when user role is `$roleType`, it returns all records",
        async ({ roleType }) => {
          // Arrange
          const role = roleFactory.build({ role: roleType })
          const requestingUser = await userFactory
            .associations({
              roles: [role],
            })
            .create()
          const datasetOwner = await userFactory.create()

          const dataset = await datasetFactory.create({
            creatorId: datasetOwner.id,
            ownerId: datasetOwner.id,
          })
          const accessibleDatasetEntry = await datasetEntryFactory.create({
            datasetId: dataset.id,
            jsonData: { field1: "value1" },
          })
          const scopedQuery = DatasetEntriesPolicy.applyScope(DatasetEntry, requestingUser)

          // Act
          const result = await scopedQuery.findAll()

          // Assert
          expect(result).toEqual([
            expect.objectContaining({
              id: accessibleDatasetEntry.id,
            }),
          ])
        }
      )

      test("when viewer role is User, and entry belongs to a dataset with accessible, screened access grants, without an approved request, restricts dataset entries", async () => {
        // Arrange
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const viewerGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const role = roleFactory.build({ role: RoleTypes.USER })
        const viewer = await userFactory
          .transient({
            include: ["groupMembership"],
          })
          .associations({
            roles: [role],
            groupMembership: viewerGroupMembership,
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
          accessType: AccessTypes.SCREENED_ACCESS,
        })
        const dataset = await datasetFactory
          .associations({
            accessGrants: [accessGrant],
          })
          .create({
            creatorId: datasetOwner.id,
            ownerId: datasetOwner.id,
          })
        await datasetEntryFactory.create({
          datasetId: dataset.id,
          jsonData: { field1: "value1" },
        })

        // Act
        const scopedDatasetEntries = DatasetEntriesPolicy.applyScope(DatasetEntry, viewer)
        const results = await scopedDatasetEntries.findAll()

        // Assert
        expect(results).toHaveLength(0)
      })

      test("when viewer role is User, and entry belongs to a dataset with accessible, screened access grants, with an approved request, shows dataset entries", async () => {
        // Arrange
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const viewerGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const role = roleFactory.build({ role: RoleTypes.USER })
        const viewer = await userFactory
          .transient({
            include: ["groupMembership"],
          })
          .associations({
            roles: [role],
            groupMembership: viewerGroupMembership,
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
          accessType: AccessTypes.SCREENED_ACCESS,
        })
        const dataset = await datasetFactory
          .associations({
            accessGrants: [accessGrant],
          })
          .create({
            creatorId: datasetOwner.id,
            ownerId: datasetOwner.id,
          })
        await accessRequestFactory.create({
          datasetId: dataset.id,
          accessGrantId: accessGrant.id,
          requestorId: viewer.id,
          approvedAt: new Date(),
        })
        const datasetEntry = await datasetEntryFactory.create({
          datasetId: dataset.id,
          jsonData: { field1: "value1" },
        })

        // Act
        const scopedDatasetEntries = DatasetEntriesPolicy.applyScope(DatasetEntry, viewer)
        const results = await scopedDatasetEntries.findAll()

        // Assert
        expect(results).toHaveLength(1)
        expect(results.map((r) => r.dataValues)).toEqual([
          expect.objectContaining({
            id: datasetEntry.id,
            datasetId: dataset.id,
            jsonData: JSON.stringify({ field1: "value1" }),
          }),
        ])
      })
    })
  })
})
