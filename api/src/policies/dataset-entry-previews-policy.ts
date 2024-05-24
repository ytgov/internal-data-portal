import { Attributes, FindOptions, Op } from "sequelize"

import { DatasetEntryPreview, User } from "@/models"
import {
  datasetsAccessibleViaAccessGrantsBy,
  datasetsAccessibleViaOwner,
  datasetsWithPreviewDisabled,
} from "@/models/datasets"
import { PolicyFactory } from "@/policies/base-policy"

export class DatasetEntryPreviewsPolicy extends PolicyFactory(DatasetEntryPreview) {
  static policyScope(user: User): FindOptions<Attributes<DatasetEntryPreview>> {
    if (user.isSystemAdmin || user.isBusinessAnalyst) {
      return {}
    }

    const datasetsAccessibleViaAccessGrantsByUserQuery = datasetsAccessibleViaAccessGrantsBy(user)
    const datasetsWithPreviewDisabledQuery = datasetsWithPreviewDisabled()

    if (user.isDataOwner) {
      const datasetsAccessibleViaOwnerQuery = datasetsAccessibleViaOwner(user)
      return {
        where: {
          datasetId: {
            [Op.or]: [
              { [Op.in]: datasetsAccessibleViaOwnerQuery },
              {
                [Op.in]: datasetsAccessibleViaAccessGrantsByUserQuery,
                [Op.notIn]: datasetsWithPreviewDisabledQuery,
              },
            ],
          },
        },
      }
    }

    return {
      where: {
        datasetId: {
          [Op.in]: datasetsAccessibleViaAccessGrantsByUserQuery,
          [Op.notIn]: datasetsWithPreviewDisabledQuery,
        },
      },
    }
  }
}

export default DatasetEntryPreviewsPolicy
