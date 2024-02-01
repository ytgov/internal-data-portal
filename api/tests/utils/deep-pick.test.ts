import { deepPick } from "@/utils/deep-pick"

describe("api/src/utils/deep-pick.ts", () => {
  describe("deepPick", () => {
    test("when given a nested object and nested keys, picks correctly", () => {
      // Arrange
      const objectToPick = {
        a: 1,
        b: 2,
        c: {
          d: 4,
          f: 5,
        },
        g: [
          {
            h: 6,
            i: 7,
          },
          {
            h: 8,
            i: 9,
          },
        ],
      }

      // Act
      const result = deepPick(objectToPick, ["a", { c: ["d"] }, { g: ["h"] }])

      // Assert
      expect(result).toEqual({ a: 1, c: { d: 4 }, g: [{ h: 6 }, { h: 8 }] })
    })
  })
})
