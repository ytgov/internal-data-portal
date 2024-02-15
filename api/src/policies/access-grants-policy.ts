import { NonAttribute } from "sequelize"

import { Path } from "@/utils/deep-pick"

import { Dataset, AccessGrant, User } from "@/models"

import BasePolicy from "@/policies/base-policy"
import DatasetsPolicy from "@/policies/datasets-policy"

export type AccessGrantWithDataset = AccessGrant & { dataset: NonAttribute<Dataset> }

export class AccessGrantsPolicy extends BasePolicy<AccessGrantWithDataset> {
  private readonly datasetsPolicy: DatasetsPolicy

  constructor(user: User, record: AccessGrantWithDataset) {
    super(user, record)
    this.datasetsPolicy = new DatasetsPolicy(this.user, this.record.dataset)
  }

  create(): boolean {
    return this.datasetsPolicy.update()
  }

  update(): boolean {
    return this.datasetsPolicy.update()
  }

  destroy(): boolean {
    return this.datasetsPolicy.update()
  }

  permittedAttributes(): Path[] {
    return ["supportId", "grantLevel", "accessType", "isProjectDescriptionRequired"]
  }

  permittedAttributesForCreate(): Path[] {
    return ["datasetId", ...this.permittedAttributes()]
  }
}

export default AccessGrantsPolicy
