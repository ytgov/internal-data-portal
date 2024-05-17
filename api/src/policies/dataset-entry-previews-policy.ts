import { ModelStatic, Op } from "sequelize"

import { DatasetEntryPreview, User } from "@/models"
import { datasetsAccessibleViaAccessGrantsBy, datasetsAccessibleViaOwner } from "@/models/datasets"

import BasePolicy from "@/policies/base-policy"

export class DatasetEntryPreviewsPolicy extends BasePolicy<DatasetEntryPreview> {
  // TODO: move this code to a shared location, somewhere?
  static applyScope(
    modelClass: ModelStatic<DatasetEntryPreview>,
    user: User
  ): ModelStatic<DatasetEntryPreview> {
    if (user.isSystemAdmin || user.isBusinessAnalyst) {
      return modelClass
    }

    const datasetEntryPreviewsWithPreviewEnabledScope = modelClass.scope("withPreviewEnabled")

    // TODO: add restriction where preview customization is enabled
    const datasetsAccessibleViaAccessGrantsByUserQuery = datasetsAccessibleViaAccessGrantsBy(user)
    if (user.isDataOwner) {
      const datasetsAccessibleViaOwnerQuery = datasetsAccessibleViaOwner(user)
      return datasetEntryPreviewsWithPreviewEnabledScope.scope({
        where: {
          datasetId: {
            [Op.or]: [
              { [Op.in]: datasetsAccessibleViaOwnerQuery },
              { [Op.in]: datasetsAccessibleViaAccessGrantsByUserQuery },
            ],
          },
        },
      })
    }

    return datasetEntryPreviewsWithPreviewEnabledScope.scope({
      where: {
        datasetId: {
          [Op.or]: [{ [Op.in]: datasetsAccessibleViaAccessGrantsByUserQuery }],
        },
      },
    })
  }
}

export default DatasetEntryPreviewsPolicy
