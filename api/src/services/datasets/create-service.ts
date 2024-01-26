import { CreationAttributes, Op } from "sequelize"
import { isEmpty } from "lodash"
import slugify from "slugify"

import db, { Dataset, User, StewardshipEvolution } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Partial<Dataset> & {
  stewardshipEvolutionsAttributes?: Partial<StewardshipEvolution>[]
}

export class CreateService extends BaseService {
  private attributes: Attributes
  private stewardshipEvolutionsAttributes: Partial<StewardshipEvolution>[]
  private currentUser: User

  constructor({ stewardshipEvolutionsAttributes, ...attributes }: Attributes, currentUser: User) {
    super()
    this.attributes = attributes
    this.stewardshipEvolutionsAttributes = stewardshipEvolutionsAttributes || []
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

    return db.transaction(async (transaction) => {
      const secureAttributes: CreationAttributes<Dataset> = {
        ...this.attributes,
        ownerId: ownerId || this.currentUser.id,
        slug,
        name,
        description,
        creatorId: this.currentUser.id,
      }

      const dataset = await Dataset.create(secureAttributes)

      this.assertStewardshipEvolutionAttributesAreValid(
        this.stewardshipEvolutionsAttributes,
        dataset.id
      )
      await StewardshipEvolution.bulkCreate(this.stewardshipEvolutionsAttributes)

      return dataset.reload({ include: ["owner", "creator", "stewardshipEvolutions"] })
    })
  }

  private assertStewardshipEvolutionAttributesAreValid(
    stewardshipEvolutionsAttributes: Partial<StewardshipEvolution>[],
    datasetId: number
  ): asserts stewardshipEvolutionsAttributes is CreationAttributes<StewardshipEvolution>[] {
    stewardshipEvolutionsAttributes.forEach((stewardshipEvolutionAttributes) => {
      stewardshipEvolutionAttributes["datasetId"] = datasetId

      if (stewardshipEvolutionAttributes.ownerId === undefined) {
        throw new Error("Stewardship evolution owner ID cannot be blank.")
      }

      if (stewardshipEvolutionAttributes.supportId === undefined) {
        throw new Error("Stewardship evolution support ID cannot be blank.")
      }

      if (
        stewardshipEvolutionAttributes.ownerName === undefined ||
        isEmpty(stewardshipEvolutionAttributes.ownerName)
      ) {
        throw new Error("Stewardship evolution owner name cannot be blank.")
      }

      if (
        stewardshipEvolutionAttributes.ownerPosition === undefined ||
        isEmpty(stewardshipEvolutionAttributes.ownerPosition)
      ) {
        throw new Error("Stewardship evolution owner position cannot be blank.")
      }

      if (
        stewardshipEvolutionAttributes.supportName === undefined ||
        isEmpty(stewardshipEvolutionAttributes.supportName)
      ) {
        throw new Error("Stewardship evolution support name cannot be blank.")
      }

      if (
        stewardshipEvolutionAttributes.supportEmail === undefined ||
        isEmpty(stewardshipEvolutionAttributes.supportEmail)
      ) {
        throw new Error("Stewardship evolution support email cannot be blank.")
      }

      if (
        stewardshipEvolutionAttributes.supportPosition === undefined ||
        isEmpty(stewardshipEvolutionAttributes.supportPosition)
      ) {
        throw new Error("Stewardship evolution support position cannot be blank.")
      }

      if (
        stewardshipEvolutionAttributes.department === undefined ||
        isEmpty(stewardshipEvolutionAttributes.department)
      ) {
        throw new Error("Stewardship evolution department cannot be blank.")
      }
    })
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
