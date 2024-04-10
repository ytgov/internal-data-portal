import { yukonGovernmentIntegration } from "@/integrations"

import { mockedAxios } from "@/support"

describe("api/src/integrations/yukon-government-integration.ts", () => {
  describe("yukonGovernmentIntegration", () => {
    describe("#searchEmployees", () => {
      test("when searching for employees, returns axios get response", async () => {
        // Arrange
        const mockedAxoisResponse = {
          employees: [
            {
              email: "john.doe@example.com",
            },
          ],
          count: 1,
        }
        mockedAxios.onGet("https://api.gov.yk.ca/directory/employees").reply(200, mockedAxoisResponse)

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
