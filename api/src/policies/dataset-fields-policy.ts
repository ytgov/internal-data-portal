import { ModelStatic, NonAttribute, Op, literal } from "sequelize"

import { Path } from "@/utils/deep-pick"
import { compactSql } from "@/utils/compact-sql"

import { Dataset, DatasetField, User } from "@/models"
import { AccessTypes } from "@/models/access-grant"
import { datasetsAccessibleViaAccessGrantsBy } from "@/models/datasets"
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

    const datasetsAccessibleViaOpenAccessGrantsByUserQuery = datasetsAccessibleViaAccessGrantsBy(user, [
      AccessTypes.OPEN_ACCESS,
    ])
    // TODO: Consider refactoring this to a function fore easier testing.
    const datasetsWithApprovedAccessRequestsQuery = literal(
      compactSql(/* sql */ `
        (
          SELECT
            datasets.id
          FROM
            datasets
          INNER JOIN access_requests ON
            access_requests.deleted_at IS NULL
            AND access_requests.dataset_id = datasets.id
          WHERE
            access_requests.requestor_id = ${user.id}
            AND access_requests.approved_at IS NOT NULL
        )
      `)
    )
    if (user.isDataOwner) {
      const datasetsAccessibleViaOwnerQuery = literal(
        compactSql(/* sql */ `
          (
            SELECT
              datasets.id
            FROM
              datasets
            WHERE datasets.owner_id = ${user.id}
          )
        `)
      )
      return modelClass.scope({
        where: {
          datasetId: {
            [Op.or]: [
              { [Op.in]: datasetsAccessibleViaOwnerQuery },
              { [Op.in]: datasetsWithApprovedAccessRequestsQuery },
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
            { [Op.in]: datasetsWithApprovedAccessRequestsQuery },
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
