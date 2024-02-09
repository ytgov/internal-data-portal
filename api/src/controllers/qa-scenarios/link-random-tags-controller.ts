import { faker } from "@faker-js/faker"

import { Tag, Tagging, Dataset } from "@/models"
import { TaggableTypes } from "@/models/tagging"

import BaseController from "@/controllers/base-controller"

export class LinkRandomTagsController extends BaseController {
  async create() {
    try {
      await Tagging.destroy({ where: {} })
      await this.ensureRandomTags()
      await this.linkRandomTagsToDatasets()
      return this.response
        .status(201)
        .json({ message: "Random tags created and linked to random datasets." })
    } catch (error) {
      return this.response
        .status(422)
        .json({ message: `Could not create and link random tags: ${error}` })
    }
  }

  private async ensureRandomTags() {
    const numberOrTags = 50
    const tagNames = faker.helpers.uniqueArray(faker.word.sample, numberOrTags)
    const promises = tagNames.map((name) =>
      Tag.upsert({
        name,
      })
    )
    return Promise.all(promises)
  }

  private async linkRandomTagsToDatasets() {
    const datasets = await Dataset.findAll()
    const tags = await Tag.findAll()

    const promises = datasets.map(async (dataset) => {
      const randomTags = faker.helpers.arrayElements(tags, { min: 1, max: 5 })
      const randomTaggingAttributes = randomTags.map((tag) => ({
        tagId: tag.id,
        taggableId: dataset.id,
        taggableType: TaggableTypes.DATASET,
      }))
      return Tagging.bulkCreate(randomTaggingAttributes)
    })

    return Promise.all(promises)
  }
}

export default LinkRandomTagsController
