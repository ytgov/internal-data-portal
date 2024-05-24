import { AccessTypes, GrantLevels } from "@/models/access-grant"
import { RoleTypes } from "@/models/role"
import { UserGroupTypes } from "@/models/user-groups"
import { DatasetEntryPreview } from "@/models"
import { DatasetEntryPreviewsPolicy } from "@/policies"
import {
  accessGrantFactory,
  datasetEntryFactory,
  datasetEntryPreviewFactory,
  datasetFactory,
  roleFactory,
  userFactory,
  userGroupFactory,
  userGroupMembershipFactory,
  visualizationControlFactory,
} from "@/factories"

describe("api/src/policies/dataset-entry-previews-policy.ts", () => {
  describe("DatasetEntryPreviewsPolicy", () => {
    describe(".applyScope", () => {
      test.each([{ roleType: RoleTypes.SYSTEM_ADMIN }, { roleType: RoleTypes.BUSINESS_ANALYST }])(
        `when viewer role is "$roleType", it returns all records`,
        async ({ roleType }) => {
          // Arrange
          const role = roleFactory.build({ role: roleType })
          const viewer = await userFactory
            .associations({
              roles: [role],
            })
            .create()
          const datasetOwner = await userFactory.create()
          const dataset = await datasetFactory.create({
            creatorId: datasetOwner.id,
            ownerId: datasetOwner.id,
          })
          const datasetEntry1 = await datasetEntryFactory.create({
            datasetId: dataset.id,
            jsonData: { field1: "value1" },
          })
          const datasetEntry2 = await datasetEntryFactory.create({
            datasetId: dataset.id,
            jsonData: { field1: "value2" },
          })
          const datasetEntry3 = await datasetEntryFactory.create({
            datasetId: dataset.id,
            jsonData: { field1: "value3" },
          })
          const datasetEntryPreview1 = await datasetEntryPreviewFactory.create({
            datasetId: dataset.id,
            datasetEntryId: datasetEntry1.id,
            jsonData: { field1: "value1" },
          })
          const datasetEntryPreview2 = await datasetEntryPreviewFactory.create({
            datasetId: dataset.id,
            datasetEntryId: datasetEntry2.id,
            jsonData: { field1: "value2" },
          })
          const datasetEntryPreview3 = await datasetEntryPreviewFactory.create({
            datasetId: dataset.id,
            datasetEntryId: datasetEntry3.id,
            jsonData: { field1: "value3" },
          })

          // Act
          const scopedQuery = DatasetEntryPreviewsPolicy.applyScope([], viewer)
          const result = await scopedQuery.findAll()

          // Assert
          expect(await DatasetEntryPreview.count()).toBe(3)
          expect(result.map((r) => r.dataValues)).toEqual([
            expect.objectContaining({
              id: datasetEntryPreview1.id,
              datasetId: dataset.id,
              datasetEntryId: datasetEntry1.id,
              jsonData: JSON.stringify({ field1: "value1" }),
            }),
            expect.objectContaining({
              id: datasetEntryPreview2.id,
              datasetId: dataset.id,
              datasetEntryId: datasetEntry2.id,
              jsonData: JSON.stringify({ field1: "value2" }),
            }),
            expect.objectContaining({
              id: datasetEntryPreview3.id,
              datasetId: dataset.id,
              datasetEntryId: datasetEntry3.id,
              jsonData: JSON.stringify({ field1: "value3" }),
            }),
          ])
        }
      )

      test("when viewer is a data owner, and owns dataset being previewed, it shows the preview records", async () => {
        // Arrange
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const viewerUserGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const viewerRole = roleFactory.build({ role: RoleTypes.DATA_OWNER })
        const viewer = await userFactory
          .transient({
            include: ["groupMembership"],
          })
          .associations({
            roles: [viewerRole],
            groupMembership: viewerUserGroupMembership,
          })
          .create()
        const otherUser = await userFactory
          .associations({
            groupMembership: datasetOwnerGroupMembership,
          })
          .create()
        const accessibleDataset = await datasetFactory.create({
          creatorId: viewer.id,
          ownerId: viewer.id,
        })
        const datasetEntry1 = await datasetEntryFactory.create({
          datasetId: accessibleDataset.id,
          jsonData: { field1: "value1" },
        })
        const datasetEntry2 = await datasetEntryFactory.create({
          datasetId: accessibleDataset.id,
          jsonData: { field1: "value2" },
        })
        const datasetEntryPreview1 = await datasetEntryPreviewFactory.create({
          datasetId: accessibleDataset.id,
          datasetEntryId: datasetEntry1.id,
          jsonData: { field1: "value1" },
        })
        const datasetEntryPreview2 = await datasetEntryPreviewFactory.create({
          datasetId: accessibleDataset.id,
          datasetEntryId: datasetEntry2.id,
          jsonData: { field1: "value2" },
        })
        const inaccessibleDataset = await datasetFactory.create({
          creatorId: otherUser.id,
          ownerId: otherUser.id,
        })
        const inaccessibleDatasetEntry = await datasetEntryFactory.create({
          datasetId: inaccessibleDataset.id,
          jsonData: { field1: "value3" },
        })
        // inaccessible dataset entry preview for control case
        await datasetEntryPreviewFactory.create({
          datasetId: inaccessibleDataset.id,
          datasetEntryId: inaccessibleDatasetEntry.id,
          jsonData: { field1: "value3" },
        })

        // Act
        const scopedQuery = DatasetEntryPreviewsPolicy.applyScope([], viewer)
        const result = await scopedQuery.findAll()

        // Assert
        expect(await DatasetEntryPreview.count()).toBe(3)
        expect(result.map((r) => r.dataValues)).toEqual([
          expect.objectContaining({
            id: datasetEntryPreview1.id,
            datasetId: accessibleDataset.id,
            datasetEntryId: datasetEntry1.id,
            jsonData: JSON.stringify({ field1: "value1" }),
          }),
          expect.objectContaining({
            id: datasetEntryPreview2.id,
            datasetId: accessibleDataset.id,
            datasetEntryId: datasetEntry2.id,
            jsonData: JSON.stringify({ field1: "value2" }),
          }),
        ])
      })

      test.each([
        {
          accessType: AccessTypes.OPEN_ACCESS,
        },
        {
          accessType: AccessTypes.SELF_SERVE_ACCESS,
        },
        {
          accessType: AccessTypes.SCREENED_ACCESS,
        },
      ])(
        `when viewer is a data owner, and dataset is accessible via "$accessType" grant, it shows the preview records`,
        async ({ accessType }) => {
          const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
          const viewerUserGroupMembership = userGroupMembershipFactory.build({
            departmentId: department.id,
          })
          const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
            departmentId: department.id,
          })
          const viewerRole = roleFactory.build({ role: RoleTypes.DATA_OWNER })
          const viewer = await userFactory
            .transient({
              include: ["groupMembership"],
            })
            .associations({
              roles: [viewerRole],
              groupMembership: viewerUserGroupMembership,
            })
            .create()
          const otherUser = await userFactory
            .associations({
              groupMembership: datasetOwnerGroupMembership,
            })
            .create()
          const accessibleDataset1 = await datasetFactory.create({
            creatorId: viewer.id,
            ownerId: viewer.id,
          })
          const datasetEntry1 = await datasetEntryFactory.create({
            datasetId: accessibleDataset1.id,
            jsonData: { field1: "value1" },
          })
          const datasetEntryPreview1 = await datasetEntryPreviewFactory.create({
            datasetId: accessibleDataset1.id,
            datasetEntryId: datasetEntry1.id,
            jsonData: { field1: "value1" },
          })
          const accessGrant = accessGrantFactory.build({
            creatorId: otherUser.id,
            grantLevel: GrantLevels.GOVERNMENT_WIDE,
            accessType,
          })
          const accessibleDataset2 = await datasetFactory
            .associations({
              accessGrants: [accessGrant],
            })
            .create({
              creatorId: otherUser.id,
              ownerId: otherUser.id,
            })
          const datasetEntry2 = await datasetEntryFactory.create({
            datasetId: accessibleDataset2.id,
            jsonData: { field1: "value2" },
          })
          const datasetEntryPreview2 = await datasetEntryPreviewFactory.create({
            datasetId: accessibleDataset2.id,
            datasetEntryId: datasetEntry2.id,
            jsonData: { field1: "value2" },
          })
          const inaccessibleDataset = await datasetFactory.create({
            creatorId: otherUser.id,
            ownerId: otherUser.id,
          })
          const inaccessibleDatasetEntry = await datasetEntryFactory.create({
            datasetId: inaccessibleDataset.id,
            jsonData: { field1: "value3" },
          })
          // inaccessible dataset entry preview for control case
          await datasetEntryPreviewFactory.create({
            datasetId: inaccessibleDataset.id,
            datasetEntryId: inaccessibleDatasetEntry.id,
            jsonData: { field1: "value3" },
          })

          // Act
          const scopedQuery = DatasetEntryPreviewsPolicy.applyScope([], viewer)
          const result = await scopedQuery.findAll()

          // Assert
          expect(await DatasetEntryPreview.count()).toBe(3)
          expect(result.map((r) => r.dataValues)).toEqual([
            expect.objectContaining({
              id: datasetEntryPreview1.id,
              datasetId: accessibleDataset1.id,
              datasetEntryId: datasetEntry1.id,
              jsonData: JSON.stringify({ field1: "value1" }),
            }),
            expect.objectContaining({
              id: datasetEntryPreview2.id,
              datasetId: accessibleDataset2.id,
              datasetEntryId: datasetEntry2.id,
              jsonData: JSON.stringify({ field1: "value2" }),
            }),
          ])
        }
      )

      test("when viewer is a data owner, and dataset is accessible via screened access grant, but dataset preivew is disabled, it restricts the preview records", async () => {
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const viewerUserGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const viewerRole = roleFactory.build({ role: RoleTypes.DATA_OWNER })
        const viewer = await userFactory
          .transient({
            include: ["groupMembership"],
          })
          .associations({
            roles: [viewerRole],
            groupMembership: viewerUserGroupMembership,
          })
          .create()
        const otherUser = await userFactory
          .associations({
            groupMembership: datasetOwnerGroupMembership,
          })
          .create()
        const accessibleDataset1 = await datasetFactory.create({
          creatorId: viewer.id,
          ownerId: viewer.id,
        })
        const datasetEntry1 = await datasetEntryFactory.create({
          datasetId: accessibleDataset1.id,
          jsonData: { field1: "value1" },
        })
        const datasetEntryPreview1 = await datasetEntryPreviewFactory.create({
          datasetId: accessibleDataset1.id,
          datasetEntryId: datasetEntry1.id,
          jsonData: { field1: "value1" },
        })
        const accessGrant = accessGrantFactory.build({
          creatorId: otherUser.id,
          grantLevel: GrantLevels.GOVERNMENT_WIDE,
          accessType: AccessTypes.SCREENED_ACCESS,
        })
        const inaccessibleDataset1 = await datasetFactory
          .associations({
            accessGrants: [accessGrant],
          })
          .create({
            creatorId: otherUser.id,
            ownerId: otherUser.id,
          })
        await visualizationControlFactory.create({
          datasetId: inaccessibleDataset1.id,
          hasPreview: false,
        })
        const datasetEntry2 = await datasetEntryFactory.create({
          datasetId: inaccessibleDataset1.id,
          jsonData: { field1: "value2" },
        })
        // inaccessible via preview mode disabled
        await datasetEntryPreviewFactory.create({
          datasetId: inaccessibleDataset1.id,
          datasetEntryId: datasetEntry2.id,
          jsonData: { field1: "value2" },
        })
        const inaccessibleDataset2 = await datasetFactory.create({
          creatorId: otherUser.id,
          ownerId: otherUser.id,
        })
        const inaccessibleDatasetEntry = await datasetEntryFactory.create({
          datasetId: inaccessibleDataset2.id,
          jsonData: { field1: "value3" },
        })
        // inaccessible dataset entry preview for control case
        await datasetEntryPreviewFactory.create({
          datasetId: inaccessibleDataset2.id,
          datasetEntryId: inaccessibleDatasetEntry.id,
          jsonData: { field1: "value3" },
        })

        // Act
        const scopedQuery = DatasetEntryPreviewsPolicy.applyScope([], viewer)
        const result = await scopedQuery.findAll()

        // Assert
        expect(await DatasetEntryPreview.count()).toBe(3)
        expect(result.map((r) => r.dataValues)).toEqual([
          expect.objectContaining({
            id: datasetEntryPreview1.id,
            datasetId: accessibleDataset1.id,
            datasetEntryId: datasetEntry1.id,
            jsonData: JSON.stringify({ field1: "value1" }),
          }),
        ])
      })

      test.each([
        {
          accessType: AccessTypes.OPEN_ACCESS,
        },
        {
          accessType: AccessTypes.SELF_SERVE_ACCESS,
        },
        {
          accessType: AccessTypes.SCREENED_ACCESS,
        },
      ])(
        `when viewer is a user, and dataset is accessible via "$accessType" grant, it shows the preview records`,
        async ({ accessType }) => {
          const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
          const viewerUserGroupMembership = userGroupMembershipFactory.build({
            departmentId: department.id,
          })
          const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
            departmentId: department.id,
          })
          const viewerRole = roleFactory.build({ role: RoleTypes.USER })
          const viewer = await userFactory
            .transient({
              include: ["groupMembership"],
            })
            .associations({
              roles: [viewerRole],
              groupMembership: viewerUserGroupMembership,
            })
            .create()
          const otherUser = await userFactory
            .associations({
              groupMembership: datasetOwnerGroupMembership,
            })
            .create()
          const accessGrant = accessGrantFactory.build({
            creatorId: otherUser.id,
            grantLevel: GrantLevels.GOVERNMENT_WIDE,
            accessType,
          })
          const accessibleDataset1 = await datasetFactory
            .associations({
              accessGrants: [accessGrant],
            })
            .create({
              creatorId: otherUser.id,
              ownerId: otherUser.id,
            })
          const datasetEntry1 = await datasetEntryFactory.create({
            datasetId: accessibleDataset1.id,
            jsonData: { field1: "value1" },
          })
          const datasetEntryPreview1 = await datasetEntryPreviewFactory.create({
            datasetId: accessibleDataset1.id,
            datasetEntryId: datasetEntry1.id,
            jsonData: { field1: "value1" },
          })
          const inaccessibleDataset = await datasetFactory.create({
            creatorId: otherUser.id,
            ownerId: otherUser.id,
          })
          const inaccessibleDatasetEntry = await datasetEntryFactory.create({
            datasetId: inaccessibleDataset.id,
            jsonData: { field1: "value2" },
          })
          // inaccessible dataset entry preview for control case
          await datasetEntryPreviewFactory.create({
            datasetId: inaccessibleDataset.id,
            datasetEntryId: inaccessibleDatasetEntry.id,
            jsonData: { field1: "value2" },
          })

          // Act
          const scopedQuery = DatasetEntryPreviewsPolicy.applyScope([], viewer)
          const result = await scopedQuery.findAll()

          // Assert
          expect(await DatasetEntryPreview.count()).toBe(2)
          expect(result.map((r) => r.dataValues)).toEqual([
            expect.objectContaining({
              id: datasetEntryPreview1.id,
              datasetId: accessibleDataset1.id,
              datasetEntryId: datasetEntry1.id,
              jsonData: JSON.stringify({ field1: "value1" }),
            }),
          ])
        }
      )

      test("when viewer is a user, and dataset is accessible via screened access grant, but dataset preivew is disabled, it restricts the preview records", async () => {
        const department = await userGroupFactory.create({ type: UserGroupTypes.DEPARTMENT })
        const viewerUserGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const datasetOwnerGroupMembership = userGroupMembershipFactory.build({
          departmentId: department.id,
        })
        const viewerRole = roleFactory.build({ role: RoleTypes.USER })
        const viewer = await userFactory
          .transient({
            include: ["groupMembership"],
          })
          .associations({
            roles: [viewerRole],
            groupMembership: viewerUserGroupMembership,
          })
          .create()
        const otherUser = await userFactory
          .associations({
            groupMembership: datasetOwnerGroupMembership,
          })
          .create()
        const accessGrant1 = accessGrantFactory.build({
          creatorId: otherUser.id,
          grantLevel: GrantLevels.GOVERNMENT_WIDE,
          accessType: AccessTypes.SCREENED_ACCESS,
        })
        const accessibleDataset1 = await datasetFactory
          .associations({
            accessGrants: [accessGrant1],
          })
          .create({
            creatorId: otherUser.id,
            ownerId: otherUser.id,
          })
        const datasetEntry1 = await datasetEntryFactory.create({
          datasetId: accessibleDataset1.id,
          jsonData: { field1: "value1" },
        })
        const datasetEntryPreview1 = await datasetEntryPreviewFactory.create({
          datasetId: accessibleDataset1.id,
          datasetEntryId: datasetEntry1.id,
          jsonData: { field1: "value1" },
        })
        const accessGrant2 = accessGrantFactory.build({
          creatorId: otherUser.id,
          grantLevel: GrantLevels.GOVERNMENT_WIDE,
          accessType: AccessTypes.SCREENED_ACCESS,
        })
        const inaccessibleDataset1 = await datasetFactory
          .associations({
            accessGrants: [accessGrant2],
          })
          .create({
            creatorId: otherUser.id,
            ownerId: otherUser.id,
          })
        await visualizationControlFactory.create({
          datasetId: inaccessibleDataset1.id,
          hasPreview: false,
        })
        const datasetEntry2 = await datasetEntryFactory.create({
          datasetId: inaccessibleDataset1.id,
          jsonData: { field1: "value2" },
        })
        // inaccessible via preview mode disabled
        await datasetEntryPreviewFactory.create({
          datasetId: inaccessibleDataset1.id,
          datasetEntryId: datasetEntry2.id,
          jsonData: { field1: "value2" },
        })

        // Act
        const scopedQuery = DatasetEntryPreviewsPolicy.applyScope([], viewer)
        const result = await scopedQuery.findAll()

        // Assert
        expect(await DatasetEntryPreview.count()).toBe(2)
        expect(result.map((r) => r.dataValues)).toEqual([
          expect.objectContaining({
            id: datasetEntryPreview1.id,
            datasetId: accessibleDataset1.id,
            datasetEntryId: datasetEntry1.id,
            jsonData: JSON.stringify({ field1: "value1" }),
          }),
        ])
      })
    })
  })
})
