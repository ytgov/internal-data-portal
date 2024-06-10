import { MockedObject } from "vitest"

import { CreateService } from "@/services/datasets"

import { RoleTypes } from "@/models/role"

import { datasetFactory, roleFactory, userFactory } from "@/factories"
import { mockCurrentUser, request } from "@/support"

vi.mock("@/services/datasets")

describe("api/src/controllers/datasets-controller.ts", () => {
  describe("DatasetsController", () => {
    let mockedCreateService: MockedObject<typeof CreateService>

    beforeEach(() => {
      mockedCreateService = vi.mocked(CreateService)
    })
    describe("#update", () => {
      test("when authorized - role is `data_owner` - and dataset creation is successful", async () => {
        // Arrange
        const dataOwnerRole = roleFactory.build({ role: RoleTypes.DATA_OWNER })
        const currentUser = await userFactory
          .associations({
            roles: [dataOwnerRole],
          })
          .transient({
            include: ["roles"],
          })
          .create()
        mockCurrentUser(currentUser)

        const newDatasetAttributes = datasetFactory.attributesFor({
          name: "test dataset creation",
          ownerId: currentUser.id,
        })
        mockedCreateService.perform.mockResolvedValue(datasetFactory.build(newDatasetAttributes))

        // Act
        const response = await request().post("/api/datasets").send(newDatasetAttributes)

        // Assert
        expect.assertions(2)
        expect(response.status).toEqual(201)
        expect(response.body).toEqual({
          dataset: expect.objectContaining({
            name: "test dataset creation",
            ownerId: currentUser.id,
          }),
        })
      })

      test("when unauthorized - role is `user`, returns a 403", async () => {
        // Arrange
        const dataOwnerRole = roleFactory.build({ role: RoleTypes.USER })
        const currentUser = await userFactory
          .associations({
            roles: [dataOwnerRole],
          })
          .transient({
            include: ["roles"],
          })
          .create()
        mockCurrentUser(currentUser)

        const newDatasetAttributes = datasetFactory.attributesFor({
          name: "test dataset creation",
          ownerId: currentUser.id,
        })

        // Act
        const response = await request().post("/api/datasets").send(newDatasetAttributes)

        // Assert
        expect.assertions(2)
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({ message: "You are not authorized to create this dataset." })
      })
    })
  })
})
