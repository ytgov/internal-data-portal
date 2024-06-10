import { SyncService } from "@/services/user-groups"

import { yukonGovernmentIntegration } from "@/integrations"

vi.mock("@/integrations", () => ({
  yukonGovernmentIntegration: {
    fetchDivisions: vi.fn(),
  },
}))
const mockedYukonGovernmentIntegration = vi.mocked(yukonGovernmentIntegration)

describe("api/src/services/user-groups/sync-service.ts", () => {
  describe("SyncService", () => {
    describe("#perform", () => {
      test("when fetched divisions includes a department record, creates the correct department", async () => {
        // Arrange
        const fetchDivisionsResult = {
          divisions: [
            { department: "Department 1", division: null, branch: null, unit: null, order: 1 },
          ],
          count: 1,
        }
        mockedYukonGovernmentIntegration.fetchDivisions.mockResolvedValue(fetchDivisionsResult)

        // Act
        const result = await SyncService.perform()

        // Assert
        expect(result).toEqual([
          expect.objectContaining({
            name: "Department 1",
            type: "department",
            order: 1,
          }),
        ])
      })
    })
  })
})
