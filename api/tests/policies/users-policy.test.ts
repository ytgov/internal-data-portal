import { userFactory } from "@/factories"

import { RoleTypes } from "@/models/role"
import { UsersPolicy } from "@/policies"

import roleFactory from "@/factories/role-factory"

describe("api/src/policies/users-policy.ts", () => {
  describe("UsersPolicy", () => {
    describe("#update", () => {
      test("when updater is a system admin, it can update the user", () => {
        // Arrange
        const adminRole = roleFactory.build({ role: RoleTypes.SYSTEM_ADMIN })
        const currentUser = userFactory.build({ roles: [adminRole] })
        const userBeingViewed = userFactory.build()

        // Act
        const policy = new UsersPolicy(currentUser, userBeingViewed)

        // Assert
        expect(policy.update()).toBe(true)
      })

      test("when updater is the current user, they can update themself", () => {
        // Arrange
        const userRole = roleFactory.build({ role: RoleTypes.USER })
        const currentUser = userFactory.build({ roles: [userRole] })

        // Act
        const policy = new UsersPolicy(currentUser, currentUser)

        // Assert
        expect(policy.update()).toBe(true)
      })

      test("when updater is a reguar user, they can't update other users", () => {
        // Arrange
        const userRole = roleFactory.build({ role: RoleTypes.USER })
        const currentUser = userFactory.build({ roles: [userRole] })
        const userBeingViewed = userFactory.build()

        // Act
        const policy = new UsersPolicy(currentUser, userBeingViewed)

        // Assert
        expect(policy.update()).toBe(false)
      })
    })
  })
})
