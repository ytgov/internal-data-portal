import { NonAttribute } from "sequelize"

import { Path } from "@/utils/deep-pick"

import { Dataset, DatasetField, User } from "@/models"

import BasePolicy from "@/policies/base-policy"
import DatasetsPolicy from "@/policies/datasets-policy"

export type DatasetFieldWithDataset = DatasetField & { dataset: NonAttribute<Dataset> }

export class DatasetFieldsPolicy extends BasePolicy<DatasetFieldWithDataset> {
  private readonly datasetsPolicy: DatasetsPolicy

  constructor(user: User, record: DatasetFieldWithDataset) {
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
    return ["name", "displayName", "dataType", "description", "note"]
  }

  permittedAttributesForCreate(): Path[] {
    return ["datasetId", ...this.permittedAttributes()]
  }
}

export default DatasetFieldsPolicy
