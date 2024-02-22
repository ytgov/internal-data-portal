import { DatasetField } from "@/models"
import { RoleTypes } from "@/models/role"
import { DatasetFieldsPolicy } from "@/policies"

import { datasetFactory, datasetFieldFactory, roleFactory, userFactory } from "@/factories"

describe("api/src/policies/dataset-fields-policy.ts", () => {
  describe("DatasetFieldsPolicy", () => {
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
          const accessibleDatasetField = await datasetFieldFactory.create({
            datasetId: dataset.id,
          })
          const scopedQuery = DatasetFieldsPolicy.applyScope(DatasetField, requestingUser)

          // Act
          const result = await scopedQuery.findAll()

          // Assert
          expect(result).toEqual([
            expect.objectContaining({
              id: accessibleDatasetField.id,
            }),
          ])
        }
      )
    })
  })
})
