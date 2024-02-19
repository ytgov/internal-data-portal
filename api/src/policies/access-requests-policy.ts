import { NonAttribute } from "sequelize"

import { Path } from "@/utils/deep-pick"

import { Dataset, AccessRequest, User } from "@/models"

import BasePolicy from "@/policies/base-policy"
import DatasetsPolicy from "@/policies/datasets-policy"

export type AccessRequestWithDataset = AccessRequest & { dataset: NonAttribute<Dataset> }

export class AccessRequestsPolicy extends BasePolicy<AccessRequestWithDataset> {
  private readonly datasetsPolicy: DatasetsPolicy

  constructor(user: User, record: AccessRequestWithDataset) {
    super(user, record)
    this.datasetsPolicy = new DatasetsPolicy(this.user, this.record.dataset)
  }

  update(): boolean {
    return this.datasetsPolicy.update()
  }

  permittedAttributes(): Path[] {
    return ["denialReason"]
  }
}

export default AccessRequestsPolicy
