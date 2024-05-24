import { isUndefined } from "lodash"

import { Path } from "@/utils/deep-pick"

import { Dataset, VisualizationControl, User } from "@/models"
import DatasetsPolicy from "@/policies/datasets-policy"

import BasePolicy from "@/policies/base-policy"

export class VisualizationControlsPolicy extends BasePolicy<VisualizationControl> {
  constructor(user: User, record: VisualizationControl) {
    super(user, record)
  }

  show(): boolean {
    return this.datasetsPolicy.show({ unlimited: true })
  }

  update(): boolean {
    return this.datasetsPolicy.update()
  }

  permittedAttributes(): Path[] {
    return [
      "isDownloadableAsCsv",
      "hasPreview",
      "hasFieldsExcludedFromPreview",
      "hasPreviewRowLimit",
      "previewRowLimit",
      { previewExcludedDatasetFieldsAttributes: ["id", "isExcludedFromPreview"] },
    ]
  }

  private get dataset(): Dataset {
    if (isUndefined(this.record.dataset)) {
      throw new Error("Expected record to have a dataset association")
    }

    return this.record.dataset
  }

  private get datasetsPolicy(): DatasetsPolicy {
    return new DatasetsPolicy(this.user, this.dataset)
  }
}

export default VisualizationControlsPolicy
