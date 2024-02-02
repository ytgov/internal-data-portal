import { yukonGovernmentIntegration } from "@/integrations"

import { mockedAxios } from "@/support"

describe("api/src/integrations/yukon-government-integration.ts", () => {
  describe("yukonGovernmentIntegration", () => {
    describe("#searchEmployees", () => {
      test("when searching for employees, returns axios get response", async () => {
        // Arrange
        const mockedAxoisResponse = {
          data: {
            employees: [
              {
                email: "john.doe@example.com",
              },
            ],
            count: 1,
          },
        }
        mockedAxios.get.mockResolvedValue(mockedAxoisResponse)

        // Act
        const { employees, count } = await yukonGovernmentIntegration.searchEmployees()

        // Assert
        expect(employees).toEqual([
          {
            email: "john.doe@example.com",
          },
        ])
        expect(count).toEqual(1)
      })
    })
  })
})
