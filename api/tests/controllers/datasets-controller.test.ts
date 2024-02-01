import { Request, Response, NextFunction } from "express"
import request from "supertest"

import app from "@/app"
import {
  ensureAndAuthorizeCurrentUser,
  type AuthorizationRequest,
} from "@/middlewares/authorization-middleware"
import { RoleTypes } from "@/models/role"

import { datasetFactory, roleFactory, userFactory } from "@/factories"

jest.mock(
  "@/middlewares/jwt-middleware",
  () => (req: Request, res: Response, next: NextFunction) => next()
)
jest.mock("@/middlewares/authorization-middleware", () => ({
  ensureAndAuthorizeCurrentUser: jest.fn(),
}))
const ensureAndAuthorizeCurrentUserMock = ensureAndAuthorizeCurrentUser as jest.Mock

describe("api/src/controllers/datasets-controller.ts", () => {
  describe("DatasetsController", () => {
    describe("#update", () => {
      test("when authorized and dataset creation is successful", async () => {
        const dataOwnerRole = roleFactory.build({ role: RoleTypes.DATA_OWNER })
        const currentUser = await userFactory
          .associations({
            roles: [dataOwnerRole],
          })
          .transient({
            include: ["roles"],
          })
          .create()
        ensureAndAuthorizeCurrentUserMock.mockImplementation(
          (req: AuthorizationRequest, res: Response, next: NextFunction) => {
            req.currentUser = currentUser
            next()
          }
        )

        // Arrange
        const newDatasetAttributes = datasetFactory.attributesFor({
          name: "test dataset creation",
          ownerId: currentUser.id,
        })

        // Act
        const response = await request(app).post("/api/datasets").send(newDatasetAttributes)

        // Assert
        expect(response.status).toEqual(201)
        expect(response.body).toEqual({
          dataset: expect.objectContaining({
            name: "test dataset creation",
          }),
        })
      })
    })
  })
})
