import { accessGrantFactory, accessRequestFactory, datasetFactory, userFactory } from "@/factories"
import { AccessTypes } from "@/models/access-grant"

import { DatasetTableActions, determineActions } from "@/serializers/datasets/table-helpers"

describe("api/src/serializers/datasets/table-helpers/determine-actions.ts", () => {
  describe(".determineActions", () => {
    test("when access type is no access, returns no actions", async () => {
      // Arrange
      const accessType = AccessTypes.NO_ACCESS
      const requestingUser = await userFactory.create()
      const datasetOwner = await userFactory.create()
      const dataset = await datasetFactory.create({
        creatorId: datasetOwner.id,
        ownerId: datasetOwner.id,
      })

      // Act
      const result = determineActions(dataset, requestingUser, accessType)

      // Assert
      expect.assertions(1)
      expect(result).toEqual(undefined)
    })

    test("when access type is open, returns no actions", async () => {
      // Arrange
      const accessType = AccessTypes.OPEN_ACCESS
      const requestingUser = await userFactory.create()
      const datasetOwner = await userFactory.create()
      const dataset = await datasetFactory
        .transient({
          include: ["accessRequests"],
        })
        .create({
          creatorId: datasetOwner.id,
          ownerId: datasetOwner.id,
        })

      // Act
      const result = determineActions(dataset, requestingUser, accessType)

      // Assert
      expect.assertions(1)
      expect(result).toEqual(undefined)
    })

    describe("when access type is self-serve", () => {
      test("when dataset has no access requests, returns subscribe action", async () => {
        // Arrange
        const accessType = AccessTypes.SELF_SERVE_ACCESS
        const requestingUser = await userFactory.create()
        const datasetOwner = await userFactory.create()
        const dataset = await datasetFactory
          .transient({
            include: ["accessRequests"],
          })
          .create({
            creatorId: datasetOwner.id,
            ownerId: datasetOwner.id,
          })

        // Act
        const result = determineActions(dataset, requestingUser, accessType)

        // Assert
        expect.assertions(1)
        expect(result).toEqual(DatasetTableActions.SUBSCRIBE)
      })

      test("when user has approved access request to dataset, returns subscribed action", async () => {
        // Arrange
        const accessType = AccessTypes.SELF_SERVE_ACCESS
        const requestingUser = await userFactory.create()
        const datasetOwner = await userFactory.create()
        const dataset = await datasetFactory.create({
          creatorId: datasetOwner.id,
          ownerId: datasetOwner.id,
        })
        const accessGrant = await accessGrantFactory.create({
          datasetId: dataset.id,
          creatorId: datasetOwner.id,
        })
        await accessRequestFactory.transient({
          approved: true
        }).create({
          datasetId: dataset.id,
          accessGrantId: accessGrant.id,
          requestorId: requestingUser.id,
        })
        await dataset.reload({
          include: ["accessRequests"],
        })

        // Act
        const result = determineActions(dataset, requestingUser, accessType)

        // Assert
        expect.assertions(1)
        expect(result).toEqual(DatasetTableActions.SUBSCRIBED)
      })

      test("when user has non-approved access request to dataset, returns subscribe action", async () => {
        // Arrange
        const accessType = AccessTypes.SELF_SERVE_ACCESS
        const requestingUser = await userFactory.create()
        const datasetOwner = await userFactory.create()
        const dataset = await datasetFactory.create({
          creatorId: datasetOwner.id,
          ownerId: datasetOwner.id,
        })
        const accessGrant = await accessGrantFactory.create({
          datasetId: dataset.id,
          creatorId: datasetOwner.id,
        })
        await accessRequestFactory.transient({
          approved: false
        }).create({
          datasetId: dataset.id,
          accessGrantId: accessGrant.id,
          requestorId: requestingUser.id,
        })
        await dataset.reload({
          include: ["accessRequests"],
        })

        // Act
        const result = determineActions(dataset, requestingUser, accessType)

        // Assert
        expect.assertions(1)
        expect(result).toEqual(DatasetTableActions.SUBSCRIBE)
      })

      test("when dataset has non-matching access request to user, returns subscribe action", async () => {
        // Arrange
        const accessType = AccessTypes.SELF_SERVE_ACCESS
        const requestingUser = await userFactory.create()
        const otherRequestingUser = await userFactory.create()
        const datasetOwner = await userFactory.create()
        const dataset = await datasetFactory.create({
          creatorId: datasetOwner.id,
          ownerId: datasetOwner.id,
        })
        const accessGrant = await accessGrantFactory.create({
          datasetId: dataset.id,
          creatorId: datasetOwner.id,
        })
        await accessRequestFactory.transient({
          approved: false
        }).create({
          datasetId: dataset.id,
          accessGrantId: accessGrant.id,
          requestorId: otherRequestingUser.id,
        })
        await dataset.reload({
          include: ["accessRequests"],
        })

        // Act
        const result = determineActions(dataset, requestingUser, accessType)

        // Assert
        expect.assertions(1)
        expect(result).toEqual(DatasetTableActions.SUBSCRIBE)
      })
    })

    describe("when access type is screened access", () => {
      test("when dataset has no access requests, returns request access action", async () => {
        // Arrange
        const accessType = AccessTypes.SCREENED_ACCESS
        const requestingUser = await userFactory.create()
        const datasetOwner = await userFactory.create()
        const dataset = await datasetFactory
          .transient({
            include: ["accessRequests"],
          })
          .create({
            creatorId: datasetOwner.id,
            ownerId: datasetOwner.id,
          })

        // Act
        const result = determineActions(dataset, requestingUser, accessType)

        // Assert
        expect.assertions(1)
        expect(result).toEqual(DatasetTableActions.REQUEST_ACCESS)
      })

      test("when user has approved access request to dataset, returns approved action", async () => {
        // Arrange
        const accessType = AccessTypes.SCREENED_ACCESS
        const requestingUser = await userFactory.create()
        const datasetOwner = await userFactory.create()
        const dataset = await datasetFactory.create({
          creatorId: datasetOwner.id,
          ownerId: datasetOwner.id,
        })
        const accessGrant = await accessGrantFactory.create({
          datasetId: dataset.id,
          creatorId: datasetOwner.id,
        })
        await accessRequestFactory.transient({
          approved: true
        }).create({
          datasetId: dataset.id,
          accessGrantId: accessGrant.id,
          requestorId: requestingUser.id,
        })
        await dataset.reload({
          include: ["accessRequests"],
        })

        // Act
        const result = determineActions(dataset, requestingUser, accessType)

        // Assert
        expect.assertions(1)
        expect(result).toEqual(DatasetTableActions.APPROVED)
      })

      test("when user has non-approved access request to dataset, returns awaiting approval action", async () => {
        // Arrange
        const accessType = AccessTypes.SCREENED_ACCESS
        const requestingUser = await userFactory.create()
        const datasetOwner = await userFactory.create()
        const dataset = await datasetFactory.create({
          creatorId: datasetOwner.id,
          ownerId: datasetOwner.id,
        })
        const accessGrant = await accessGrantFactory.create({
          datasetId: dataset.id,
          creatorId: datasetOwner.id,
        })
        await accessRequestFactory.transient({
          approved: false
        }).create({
          datasetId: dataset.id,
          accessGrantId: accessGrant.id,
          requestorId: requestingUser.id,
        })
        await dataset.reload({
          include: ["accessRequests"],
        })

        // Act
        const result = determineActions(dataset, requestingUser, accessType)

        // Assert
        expect.assertions(1)
        expect(result).toEqual(DatasetTableActions.AWAITING_APPROVAL)
      })

      test("when dataset has non-matching access request to user, returns request access action", async () => {
        // Arrange
        const accessType = AccessTypes.SCREENED_ACCESS
        const requestingUser = await userFactory.create()
        const otherRequestingUser = await userFactory.create()
        const datasetOwner = await userFactory.create()
        const dataset = await datasetFactory.create({
          creatorId: datasetOwner.id,
          ownerId: datasetOwner.id,
        })
        const accessGrant = await accessGrantFactory.create({
          datasetId: dataset.id,
          creatorId: datasetOwner.id,
        })
        await accessRequestFactory.transient({
          approved: false
        }).create({
          datasetId: dataset.id,
          accessGrantId: accessGrant.id,
          requestorId: otherRequestingUser.id,
        })
        await dataset.reload({
          include: ["accessRequests"],
        })

        // Act
        const result = determineActions(dataset, requestingUser, accessType)

        // Assert
        expect.assertions(1)
        expect(result).toEqual(DatasetTableActions.REQUEST_ACCESS)
      })
    })
  })
})
