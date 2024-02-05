import { AccessTypes, GrantLevels } from "@/models/access-grant"

import {
  accessGrantFactory,
  datasetFactory,
  stewardshipEvolutionFactory,
  userFactory,
} from "@/factories"

import { determineAccess } from "@/serializers/datasets/table-helpers"

describe("api/src/serializers/datasets/table/determine-access.ts", () => {
  describe(".determineAccess", () => {
    describe("when datataset has access grant with open access", () => {
      test("when grant level is government wide, returns open access", async () => {
        // Arrange
        const requestingUser = await userFactory.create()
        const datasetOwner = await userFactory.create()
        const openAccessGrant = accessGrantFactory.build({
          ownerId: datasetOwner.id,
          grantLevel: GrantLevels.GOVERNMENT_WIDE,
          accessType: AccessTypes.OPEN_ACCESS,
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
    })

    describe("when grant level is department", () => {
      test("when user group membership matches access grant owner group membership, returns open access", async () => {
        // Arrange
        const requestingUser = await userFactory.create()
        const datasetOwner = await userFactory.create()
        const openAccessGrant = accessGrantFactory.build({
          ownerId: datasetOwner.id,
          grantLevel: GrantLevels.DEPARTMENT,
          accessType: AccessTypes.OPEN_ACCESS,
        })
        const stewardshipEvolution = stewardshipEvolutionFactory.build({
          ownerId: datasetOwner.id,
          department: requestingUser.department?.name,
        })
        const dataset = await datasetFactory
          .transient({
            include: ["owner", "accessGrants"],
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

      // test("when user group membership does not match access grant owner group membership, returns no access", async () => {
      // })
    })
  })
})
