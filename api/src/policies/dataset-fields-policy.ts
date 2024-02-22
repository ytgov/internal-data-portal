import { ModelStatic, NonAttribute } from "sequelize"

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

  static applyScope(modelClass: ModelStatic<DatasetField>, user: User): ModelStatic<DatasetField> {
    if (user.isSystemAdmin || user.isBusinessAnalyst) {
      return modelClass
    }

    // TODO: add filter for data owner
    if (user.isDataOwner) {
      return modelClass
    }

    // TODO: add filter for user
    return modelClass
  }

  permittedAttributes(): Path[] {
    return ["name", "displayName", "dataType", "description", "note"]
  }

  permittedAttributesForCreate(): Path[] {
    return ["datasetId", ...this.permittedAttributes()]
  }
}

export default DatasetFieldsPolicy
