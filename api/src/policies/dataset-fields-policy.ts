import { Attributes, FindOptions, NonAttribute, Op } from "sequelize"

import { Path } from "@/utils/deep-pick"

import { Dataset, DatasetField, User } from "@/models"
import { AccessTypes } from "@/models/access-grant"
import {
  datasetsAccessibleViaAccessGrantsBy,
  datasetsAccessibleViaOwner,
  datasetsWithApprovedAccessRequestsFor,
  datasetsWithFieldExclusionsDisabled,
  datasetsWithPreviewDisabled,
} from "@/models/datasets"
import { PolicyFactory } from "@/policies/base-policy"
import DatasetsPolicy from "@/policies/datasets-policy"

export type DatasetFieldWithDataset = DatasetField & { dataset: NonAttribute<Dataset> }

export class DatasetFieldsPolicy extends PolicyFactory<DatasetField, DatasetFieldWithDataset>(
  DatasetField
) {
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

  static policyScope(user: User): FindOptions<Attributes<DatasetField>> {
    if (user.isSystemAdmin || user.isBusinessAnalyst) {
      return {}
    }

    const datasetsAccessibleViaOpenAccessGrantsByUserQuery = datasetsAccessibleViaAccessGrantsBy(
      user,
      [AccessTypes.OPEN_ACCESS]
    )
    const datasetsAccessibleViaAccessGrantsByUserQuery = datasetsAccessibleViaAccessGrantsBy(user, [
      AccessTypes.OPEN_ACCESS,
      AccessTypes.SELF_SERVE_ACCESS,
      AccessTypes.SCREENED_ACCESS,
    ])
    const datasetsWithApprovedAccessRequestsForUserQuery =
      datasetsWithApprovedAccessRequestsFor(user)
    const datasetsWithPreviewDisabledQuery = datasetsWithPreviewDisabled()
    const datasetsWithFieldExclusionsDisabledQuery = datasetsWithFieldExclusionsDisabled()

    const accessibleViaPreviewQuery = {
      datasetId: {
        [Op.in]: datasetsAccessibleViaAccessGrantsByUserQuery,
        [Op.notIn]: datasetsWithPreviewDisabledQuery,
      },
      [Op.or]: [
        {
          isExcludedFromPreview: false,
        },
        {
          datasetId: {
            [Op.in]: datasetsWithFieldExclusionsDisabledQuery,
          },
        },
      ],
    }
    if (user.isDataOwner) {
      const datasetsAccessibleViaOwnerQuery = datasetsAccessibleViaOwner(user)
      return {
        where: {
          [Op.or]: [
            {
              datasetId: {
                [Op.or]: [
                  { [Op.in]: datasetsAccessibleViaOwnerQuery },
                  { [Op.in]: datasetsWithApprovedAccessRequestsForUserQuery },
                  { [Op.in]: datasetsAccessibleViaOpenAccessGrantsByUserQuery },
                ],
              },
            },
            accessibleViaPreviewQuery,
          ],
        },
      }
    }

    return {
      where: {
        [Op.or]: [
          {
            datasetId: {
              [Op.or]: [
                { [Op.in]: datasetsWithApprovedAccessRequestsForUserQuery },
                { [Op.in]: datasetsAccessibleViaOpenAccessGrantsByUserQuery },
              ],
            },
          },
          accessibleViaPreviewQuery,
        ],
      },
    }
  }

  permittedAttributes(): Path[] {
    return ["name", "displayName", "dataType", "description", "note", "isExcludedFromPreview"]
  }

  permittedAttributesForCreate(): Path[] {
    return ["datasetId", ...this.permittedAttributes()]
  }
}

export default DatasetFieldsPolicy
