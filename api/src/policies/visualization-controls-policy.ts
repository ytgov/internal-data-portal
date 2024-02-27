import { NonAttribute } from "sequelize"

import { Path } from "@/utils/deep-pick"

import { Dataset, VisualizationControl, User } from "@/models"
import DatasetsPolicy from "@/policies/datasets-policy"

import BasePolicy from "@/policies/base-policy"

export type VisualizationControlWithDataset = VisualizationControl & {
  dataset: NonAttribute<Dataset>
}

export class VisualizationControlsPolicy extends BasePolicy<VisualizationControlWithDataset> {
  private readonly dataset: Dataset
  private readonly datasetsPolicy: DatasetsPolicy

  constructor(user: User, record: VisualizationControlWithDataset) {
    super(user, record)
    this.dataset = record.dataset
    this.datasetsPolicy = new DatasetsPolicy(this.user, this.record.dataset)
  }

  show(): boolean {
    if (this.datasetsPolicy.update()) {
      return true
    }

    if (this.dataset.isAccessibleViaOpenAccessGrantBy(this.user)) {
      return true
    }

    if (this.dataset.hasApprovedAccessRequestFor(this.user)) {
      return true
    }

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
