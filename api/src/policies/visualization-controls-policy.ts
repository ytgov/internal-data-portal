import { NonAttribute } from "sequelize"

import { Path } from "@/utils/deep-pick"

import { Dataset, VisualizationControl, User } from "@/models"
import DatasetsPolicy from "@/policies/datasets-policy"

import BasePolicy from "@/policies/base-policy"

export type VisualizationControlWithDataset = VisualizationControl & {
  dataset: NonAttribute<Dataset>
}

export class VisualizationControlsPolicy extends BasePolicy<VisualizationControlWithDataset> {
  private readonly datasetsPolicy: DatasetsPolicy

  constructor(user: User, record: VisualizationControlWithDataset) {
    super(user, record)
    this.datasetsPolicy = new DatasetsPolicy(this.user, this.record.dataset)
  }

  show(): boolean {
    if (this.user.isSystemAdmin || this.user.isBusinessAnalyst) {
      return true
    }

    if (this.user.isDataOwner && this.record.dataset.ownerId === this.user.id) {
      return true
    }

    if (this.record.dataset.isAccessibleViaOpenAccessGrantBy(this.user)) {
      return true
    }

    // TODO: return true if the user has an approved access request for the dataset

    return false
  }

  update(): boolean {
    return this.datasetsPolicy.update()
  }

  permittedAttributes(): Path[] {
    return [
      "isDowloadableAsCsv",
      "hasSearchRestrictions",
      "hasSearchFieldRestrictions",
      "hasSearchRowLimits",
      "searchRowLimitMaximum",
    ]
  }
}

export default VisualizationControlsPolicy
