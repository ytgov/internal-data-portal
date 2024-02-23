import { arrayToSqlInClause } from "@/utils/array-to-sql-in-clause"

describe("api/src/utils/array-to-sql-in-clause.ts", () => {
  describe(".arrayToSqlInClause", () => {
    test.each([
      {
        input: ["a"],
        output: `'a'`,
      },
      {
        input: ["a", "b"],
        output: `'a', 'b'`,
      },
      {
        input: ["a", "b", "c"],
        output: `'a', 'b', 'c'`,
      },
    ])("when given $input, returns $output", ({ input, output}) => {
      // Act
      const result = arrayToSqlInClause(input)

      // Assert
      expect(result).toEqual(output)
    })
  })
})
