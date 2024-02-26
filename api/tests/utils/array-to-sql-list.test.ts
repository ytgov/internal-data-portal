import { arrayToSqlList } from "@/utils/array-to-sql-list"

describe("api/src/utils/array-to-sql-list.ts", () => {
  describe(".arrayToSqlList", () => {
    test.each([
      {
        input: ["a"],
        output: `('a')`,
      },
      {
        input: ["a", "b"],
        output: `('a', 'b')`,
      },
      {
        input: ["a", "b", "c"],
        output: `('a', 'b', 'c')`,
      },
    ])("when given $input, returns $output", ({ input, output}) => {
      // Act
      const result = arrayToSqlList(input)

      // Assert
      expect(result).toEqual(output)
    })
  })
})
