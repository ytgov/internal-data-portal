import { Op } from "sequelize"

import { Dataset } from "@/models"
import { AccessTypes, GrantLevels } from "@/models/access-grant"

import { datasetsWithApprovedAccessRequestsFor } from "@/models/datasets"

import { accessGrantFactory, accessRequestFactory, datasetFactory, userFactory } from "@/factories"

describe("api/src/models/datasets/datasets-with-approved-access-requests-for.ts", () => {
  describe(".datasetsWithApprovedAccessRequestsFor", () => {
    test("when access requests are approved, it returns datasets", async () => {
      // Arrange
      const requestingUser = await userFactory.create()

      const datasetOwner = await userFactory.create()

      const screenedAccessGrant = accessGrantFactory.build({
        creatorId: datasetOwner.id,
        grantLevel: GrantLevels.GOVERNMENT_WIDE,
        accessType: AccessTypes.SCREENED_ACCESS,
      })
      const screenedDataset = await datasetFactory
        .associations({
          accessGrants: [screenedAccessGrant],
        })
        .create({
          creatorId: datasetOwner.id,
          ownerId: datasetOwner.id,
        })
      await accessRequestFactory.create({
        datasetId: screenedDataset.id,
        accessGrantId: screenedAccessGrant.id,
        requestorId: requestingUser.id,
        approvedAt: new Date(),
      })
      // inaccessible Dataset - for control case
      await datasetFactory
        .associations({
          accessGrants: [],
        })
        .create({
          creatorId: datasetOwner.id,
          ownerId: datasetOwner.id,
        })

      // Act
      const query = datasetsWithApprovedAccessRequestsFor(requestingUser)
      const scope = Dataset.scope({ where: { id: { [Op.in]: query } } })
      const result = await scope.findAll()

      // Assert
      expect(Dataset.count()).resolves.toBe(2)
      expect(result).toEqual([
        expect.objectContaining({
          id: screenedDataset.id,
        }),
      ])
    })

    test("when access requests are not approved, it does not return datasets", async () => {
      // Arrange
      const requestingUser = await userFactory.create()

      const datasetOwner = await userFactory.create()

      const screenedAccessGrant = accessGrantFactory.build({
        creatorId: datasetOwner.id,
        grantLevel: GrantLevels.GOVERNMENT_WIDE,
        accessType: AccessTypes.SCREENED_ACCESS,
      })
      const screenedDataset = await datasetFactory
        .associations({
          accessGrants: [screenedAccessGrant],
        })
        .create({
          creatorId: datasetOwner.id,
          ownerId: datasetOwner.id,
        })
      await accessRequestFactory.create({
        datasetId: screenedDataset.id,
        accessGrantId: screenedAccessGrant.id,
        requestorId: requestingUser.id,
        approvedAt: null,
      })

      // Act
      const query = datasetsWithApprovedAccessRequestsFor(requestingUser)
      const scope = Dataset.scope({ where: { id: { [Op.in]: query } } })
      const result = await scope.findAll()

      // Assert
      expect(Dataset.count()).resolves.toBe(1)
      expect(result).toHaveLength(0)
    })
  })
})
