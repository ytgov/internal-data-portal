import { deepPick } from "@/utils/deep-pick"

describe("api/src/utils/deep-pick.ts", () => {
  describe("deepPick", () => {
    test("when given a nested object and nested keys, picks correctly", () => {
      // Arrange
      const objectToPick = {
        a: 1,
        b: 2,
        c: 3,
        d: {
          a: 1,
          b: 2,
          c: 3,
        },
        e: {
          a: 1,
          b: 2,
          c: 3,
        },
        f: [
          {
            a: 1,
            b: 2,
            c: 3,
          },
          {
            a: 1,
            b: 2,
            c: 3,
          },
        ],
      }

      // Act
      const result = deepPick(objectToPick, ["a", "b", { d: ["a", "b"] }, { f: ["a", "b"] }])

      // Assert
      expect(result).toEqual({
        a: 1,
        b: 2,
        d: { a: 1, b: 2 },
        f: [
          { a: 1, b: 2 },
          { a: 1, b: 2 },
        ],
      })
    })

    test("when pick options reference non-existent value in path, picks correctly", () => {
      // Arrange
      const objectToPick = {
        a: 1,
        b: 2,
        c: 3,
      }

      // Act
      const result = deepPick(objectToPick, [
        "a",
        "b",
        {
          d: ["a", "b"],
        },
      ])

      // Assert
      expect(result).toEqual({
        a: 1,
        b: 2,
      })
    })

    test("when pick options path references simple value in path, picks correctly", () => {
      // Arrange
      const objectToPick = {
        a: 1,
        b: 2,
        c: 3,
        d: 4,
      }

      // Act
      const result = deepPick(objectToPick, [
        "a",
        "b",
        {
          d: ["a", "b"],
        },
      ])

      // Assert
      expect(result).toEqual({
        a: 1,
        b: 2,
        d: 4,
      })
    })
  })
})
