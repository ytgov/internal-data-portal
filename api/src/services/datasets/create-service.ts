import { CreationAttributes } from "sequelize"
import { isEmpty } from "lodash"
import slugify from "slugify"

import { Dataset, User } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Partial<Dataset>

export class CreateService extends BaseService {
  private attributes: Attributes
  private currentUser: User

  constructor(attributes: Attributes, currentUser: User) {
    super()
    this.attributes = attributes
    this.currentUser = currentUser
  }

  async perform(): Promise<Dataset> {
    const { ownerId, name, description } = this.attributes
    if (name === undefined || isEmpty(name)) {
      throw new Error("Dataset name cannot be blank.")
    }

    if (description === undefined || isEmpty(description)) {
      throw new Error("Dataset description cannot be blank.")
    }

    const slug = await this.generateSafeSlug(name)

    const secureAttributes: CreationAttributes<Dataset> = {
      ...this.attributes,
      ownerId: ownerId || this.currentUser.id,
      slug,
      name,
      description,
      creatorId: this.currentUser.id,
    }

    return Dataset.create(secureAttributes)
  }

  private async generateSafeSlug(source: string): Promise<string> {
    const baseSlug = slugify(source, { lower: true, strict: true })

    let potentialSlug = baseSlug
    let counter = 1
    let existingDataset = null
    while (true) {
      existingDataset = await Dataset.findOne({ where: { slug: potentialSlug } })

      if (existingDataset === null) {
        break
      }

      potentialSlug = `${baseSlug}-${counter}`
      counter += 1
    }

    return potentialSlug
  }
}

export default CreateService
