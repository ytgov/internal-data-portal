import { ModelStatic, NonAttribute, Op } from "sequelize"

import { Path } from "@/utils/deep-pick"

import { Dataset, DatasetField, User } from "@/models"
import { AccessTypes } from "@/models/access-grant"
import {
  datasetsAccessibleViaAccessGrantsBy,
  datasetsAccessibleViaOwner,
  datasetsWithApprovedAccessRequestsFor,
} from "@/models/datasets"
import DatasetsPolicy from "@/policies/datasets-policy"

import BasePolicy from "@/policies/base-policy"

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

    const datasetsAccessibleViaOpenAccessGrantsByUserQuery = datasetsAccessibleViaAccessGrantsBy(
      user,
      [AccessTypes.OPEN_ACCESS]
    )
    const datasetsWithApprovedAccessRequestsForUserQuery =
      datasetsWithApprovedAccessRequestsFor(user)
    if (user.isDataOwner) {
      const datasetsAccessibleViaOwnerQuery = datasetsAccessibleViaOwner(user)
      return modelClass.scope({
        where: {
          datasetId: {
            [Op.or]: [
              { [Op.in]: datasetsAccessibleViaOwnerQuery },
              { [Op.in]: datasetsWithApprovedAccessRequestsForUserQuery },
              { [Op.in]: datasetsAccessibleViaOpenAccessGrantsByUserQuery },
            ],
          },
        },
      })
    }

    return modelClass.scope({
      where: {
        datasetId: {
          [Op.or]: [
            { [Op.in]: datasetsWithApprovedAccessRequestsForUserQuery },
            { [Op.in]: datasetsAccessibleViaOpenAccessGrantsByUserQuery },
          ],
        },
      },
    })
  }

  permittedAttributes(): Path[] {
    return ["name", "displayName", "dataType", "description", "note"]
  }

  permittedAttributesForCreate(): Path[] {
    return ["datasetId", ...this.permittedAttributes()]
  }
}

export default DatasetFieldsPolicy
