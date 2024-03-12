import { AccessRequest } from "@/models"
import { RoleTypes } from "@/models/role"

import { AccessRequestsPolicy } from "@/policies"

import {
  accessGrantFactory,
  accessRequestFactory,
  datasetFactory,
  roleFactory,
  userFactory,
} from "@/factories"

describe("api/src/policies/access-requests-policy.ts", () => {
  describe("AccessRequestsPolicy", () => {
    describe(".policyScope", () => {
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

          const datasetOwner1 = await userFactory.create()
          const requestor1 = await userFactory.create()
          const dataset1 = await datasetFactory.create({
            creatorId: datasetOwner1.id,
            ownerId: datasetOwner1.id,
          })
          const accessGrant1 = await accessGrantFactory.create({
            creatorId: datasetOwner1.id,
            datasetId: dataset1.id,
          })
          const accessRequest1 = await accessRequestFactory.create({
            datasetId: dataset1.id,
            accessGrantId: accessGrant1.id,
            requestorId: requestor1.id,
          })
          const datasetOwner2 = await userFactory.create()
          const requestor2 = await userFactory.create()
          const dataset2 = await datasetFactory.create({
            creatorId: datasetOwner2.id,
            ownerId: datasetOwner2.id,
          })
          const accessGrant2 = await accessGrantFactory.create({
            creatorId: datasetOwner2.id,
            datasetId: dataset2.id,
          })
          const accessRequest2 = await accessRequestFactory.create({
            datasetId: dataset2.id,
            accessGrantId: accessGrant2.id,
            requestorId: requestor2.id,
          })
          const scopedQuery = AccessRequestsPolicy.applyScope(AccessRequest, requestingUser)

          // Act
          const result = await scopedQuery.findAll()

          // Assert
          expect(result).toEqual([
            expect.objectContaining({
              id: accessRequest1.id,
            }),
            expect.objectContaining({
              id: accessRequest2.id,
            }),
          ])
        }
      )

      test("when user role is `data_owner`, it returns only records where the user is the dataset owner", async () => {
        // Arrange
        const role = roleFactory.build({ role: RoleTypes.DATA_OWNER })
        const requestingUser = await userFactory
          .associations({
            roles: [role],
          })
          .create()

        const requestor1 = await userFactory.create()
        const dataset1 = await datasetFactory.create({
          creatorId: requestingUser.id,
          ownerId: requestingUser.id,
        })
        const accessGrant1 = await accessGrantFactory.create({
          creatorId: requestingUser.id,
          datasetId: dataset1.id,
        })
        const accessRequest1 = await accessRequestFactory.create({
          datasetId: dataset1.id,
          accessGrantId: accessGrant1.id,
          requestorId: requestor1.id,
        })
        const datasetOwner2 = await userFactory.create()
        const requestor2 = await userFactory.create()
        const dataset2 = await datasetFactory.create({
          creatorId: datasetOwner2.id,
          ownerId: datasetOwner2.id,
        })
        const accessGrant2 = await accessGrantFactory.create({
          creatorId: datasetOwner2.id,
          datasetId: dataset2.id,
        })
        // inaccessible access request for control case
        await accessRequestFactory.create({
          datasetId: dataset2.id,
          accessGrantId: accessGrant2.id,
          requestorId: requestor2.id,
        })
        const scopedQuery = AccessRequestsPolicy.applyScope(AccessRequest, requestingUser)

        // Act
        const result = await scopedQuery.findAll()

        // Assert
        expect(result).toEqual([
          expect.objectContaining({
            id: accessRequest1.id,
          }),
        ])
      })

      test("when user role is `user`, it returns only records where the user is the requestor", async () => {
        // Arrange
        const role = roleFactory.build({ role: RoleTypes.USER })
        const requestingUser = await userFactory
          .associations({
            roles: [role],
          })
          .create()

        const datasetOwner1 = await userFactory.create()
        const dataset1 = await datasetFactory.create({
          creatorId: datasetOwner1.id,
          ownerId: datasetOwner1.id,
        })
        const accessGrant1 = await accessGrantFactory.create({
          creatorId: datasetOwner1.id,
          datasetId: dataset1.id,
        })
        const accessRequest1 = await accessRequestFactory.create({
          datasetId: dataset1.id,
          accessGrantId: accessGrant1.id,
          requestorId: requestingUser.id,
        })
        const datasetOwner2 = await userFactory.create()
        const requestor2 = await userFactory.create()
        const dataset2 = await datasetFactory.create({
          creatorId: datasetOwner2.id,
          ownerId: datasetOwner2.id,
        })
        const accessGrant2 = await accessGrantFactory.create({
          creatorId: datasetOwner2.id,
          datasetId: dataset2.id,
        })
        // inaccessible access request for control case
        await accessRequestFactory.create({
          datasetId: dataset2.id,
          accessGrantId: accessGrant2.id,
          requestorId: requestor2.id,
        })
        const scopedQuery = AccessRequestsPolicy.applyScope(AccessRequest, requestingUser)

        // Act
        const result = await scopedQuery.findAll()

        // Assert
        expect(result).toEqual([
          expect.objectContaining({
            id: accessRequest1.id,
          }),
        ])
      })
    })
  })
})
