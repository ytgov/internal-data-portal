import { CreationAttributes, Op } from "sequelize"
import { isEmpty, isNil } from "lodash"
import slugify from "slugify"

import db, { Dataset, User, DatasetStewardship } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Partial<Dataset> & {
  stewardshipAttributes?: Partial<DatasetStewardship>
}

export class CreateService extends BaseService {
  private attributes: Attributes
  private stewardshipAttributes: Partial<DatasetStewardship> | undefined
  private currentUser: User

  constructor({ stewardshipAttributes, ...attributes }: Attributes, currentUser: User) {
    super()
    this.attributes = attributes
    this.stewardshipAttributes = stewardshipAttributes
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

    return db.transaction(async () => {
      const secureAttributes: CreationAttributes<Dataset> = {
        ...this.attributes,
        ownerId: ownerId || this.currentUser.id,
        slug,
        name,
        description,
        creatorId: this.currentUser.id,
      }

      const dataset = await Dataset.create(secureAttributes)

      const processedStewardshipAttributes = this.processAndValidateStewardshipAttributes(
        this.stewardshipAttributes,
        dataset.id
      )
      await DatasetStewardship.create(processedStewardshipAttributes)

      return dataset.reload({ include: ["owner", "creator", "stewardship"] })
    })
  }

  private processAndValidateStewardshipAttributes(
    stewardshipAttributes: Partial<DatasetStewardship> | undefined,
    datasetId: number
  ): CreationAttributes<DatasetStewardship> {
    if (isNil(stewardshipAttributes)) {
      throw new Error("Stewardship attributes must be supplied.")
    }

    if (stewardshipAttributes.ownerId === undefined) {
      throw new Error("Stewardship owner ID cannot be blank.")
    }

    if (stewardshipAttributes.supportId === undefined) {
      throw new Error("Stewardship support ID cannot be blank.")
    }

    if (stewardshipAttributes.departmentId === undefined) {
      throw new Error("Stewardship department ID cannot be blank.")
    }

    stewardshipAttributes["datasetId"] = datasetId

    return stewardshipAttributes
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

    const slugMatcher = new RegExp(`${baseSlug}-[1-9][0-9]*$`)
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
