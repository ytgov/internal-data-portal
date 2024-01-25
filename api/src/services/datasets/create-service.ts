import { CreationAttributes, Op } from "sequelize"
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

  // TODO: move to utility or model and add tests.
  private async generateSafeSlug(source: string): Promise<string> {
    const baseSlug = slugify(source, { lower: true, strict: true })

    const existingDatasets = await Dataset.findAll({
      attributes: ["slug"],
      where: {
        slug: {
          [Op.like]: `${baseSlug}%`,
        },
      },
    })

    const slugMatcher = new RegExp(`${baseSlug}\-[1-9][0-9]*$`)
    const relevantDatasets = existingDatasets.filter(
      ({ slug }) => slug === baseSlug || slugMatcher.test(slug)
    )

    if (relevantDatasets.length === 0) {
      return baseSlug
    }

    const highestCounter = relevantDatasets.reduce((currentCounter, { slug }) => {
      if (slug === baseSlug) {
        return currentCounter
      }

      const newCounter = parseInt(slug.replace(`${baseSlug}-`, ""))
      if (newCounter > currentCounter) {
        return newCounter
      }

      return currentCounter
    }, 0)

    const nextCounter = highestCounter + 1
    return `${baseSlug}-${nextCounter}`
  }
}

export default CreateService
