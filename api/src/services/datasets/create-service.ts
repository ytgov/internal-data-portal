import { CreationAttributes } from "sequelize"

import { Dataset, User } from "@/models"

import BaseService from "@/services/base-service"
import { isEmpty } from "lodash"

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
    const { name, description } = this.attributes
    if (name === undefined || isEmpty(name)) {
      throw new Error("Dataset name cannot be blank.")
    }

    if (description === undefined || isEmpty(description)) {
      throw new Error("Dataset description cannot be blank.")
    }

    const secureAttributes: CreationAttributes<Dataset> = {
      ...this.attributes,
      name,
      slug: name,
      description,
      ownerId: this.currentUser.id,
    }

    return Dataset.create(secureAttributes)
  }
}

export default CreateService
