import { Op } from "sequelize"

import { Dataset } from "@/models"
import { datasetsWithPreviewDisabled } from "@/models/datasets"
import { datasetFactory, userFactory, visualizationControlFactory } from "@/factories"

describe("api/src/models/datasets/datasets-with-preview-disabled.ts", () => {
  describe(".datasetsWithPreviewDisabled", () => {
    test("when dataset visualization control has preview disabled, restricts the result", async () => {
      // Arrange
      const user = await userFactory.create()
      const dataset = await datasetFactory.create({
        creatorId: user.id,
        ownerId: user.id,
      })
      await visualizationControlFactory.create({
        datasetId: dataset.id,
        hasPreview: false,
      })

      // Act
      const query = datasetsWithPreviewDisabled()
      const result = await Dataset.findAll({
        where: { id: { [Op.notIn]: query } },
      })

      expect(await Dataset.count()).toBe(1)
      expect(result).toHaveLength(0)
      expect(result).toEqual([])
    })

    test("when dataset visualization control has preview enabled, shows the result", async () => {
      // Arrange
      const user = await userFactory.create()
      const dataset = await datasetFactory.create({
        creatorId: user.id,
        ownerId: user.id,
      })
      await visualizationControlFactory.create({
        datasetId: dataset.id,
        hasPreview: true,
      })

      // Act
      const query = datasetsWithPreviewDisabled()
      const result = await Dataset.findAll({
        where: { id: { [Op.notIn]: query } },
      })

      expect(await Dataset.count()).toBe(1)
      expect(result).toHaveLength(1)
      expect(result).toEqual([
        expect.objectContaining({
          id: dataset.id,
        }),
      ])
    })
  })
})
