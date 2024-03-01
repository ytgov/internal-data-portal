import { isUndefined } from "lodash"

import { Path } from "@/utils/deep-pick"

import { Dataset, DatasetIntegration } from "@/models"
import DatasetsPolicy from "@/policies/datasets-policy"

import BasePolicy from "@/policies/base-policy"

export class DatasetIntegrationsPolicy extends BasePolicy<DatasetIntegration> {
  // TODO: investigate if this is correct
  show(): boolean {
    return this.datasetsPolicy.update()
  }

  create(): boolean {
    return this.datasetsPolicy.update()
  }

  update(): boolean {
    return this.datasetsPolicy.update()
  }

  permittedAttributes(): Path[] {
    return ["url", "headerKey", "headerValue", "jmesPathTransform"]
  }

  permittedAttributesForCreate(): Path[] {
    return ["datasetId", ...this.permittedAttributes()]
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

export default DatasetIntegrationsPolicy
