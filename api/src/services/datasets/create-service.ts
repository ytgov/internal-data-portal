import { CreationAttributes, QueryTypes } from "sequelize"
import { isEmpty } from "lodash"
import slugify from "slugify"

import db, { Dataset, User } from "@/models"

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

    const [result] = await db.query<{ determinant: number }>(
      `
        WITH determinants AS (
          SELECT
            CASE
              WHEN REPLACE(slug, :baseSlug, '') = '' THEN 0
              ELSE CAST(REPLACE(slug, :baseSlugWithDash, '') AS INT)
            END AS determinant
          FROM datasets
          WHERE slug LIKE :baseSlugPattern
        )
        SELECT TOP 1 determinant
        FROM determinants
        ORDER BY determinant DESC;
      `,
      {
        replacements: {
          baseSlug,
          baseSlugWithDash: `${baseSlug}-`,
          baseSlugPattern: `${baseSlug}%`,
        },
        type: QueryTypes.SELECT,
      }
    )

    if (result === undefined) {
      return baseSlug
    }

    const highestCounter = result.determinant
    const nextCounter = highestCounter + 1
    return `${baseSlug}-${nextCounter}`
  }
}

export default CreateService
