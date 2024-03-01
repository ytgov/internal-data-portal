import { ModelStatic, Op } from "sequelize"

import { DatasetEntry, User } from "@/models"
import { AccessTypes } from "@/models/access-grant"
import {
  datasetsAccessibleViaAccessGrantsBy,
  datasetsAccessibleViaOwner,
  datasetsWithApprovedAccessRequestsFor,
} from "@/models/datasets"

import BasePolicy from "@/policies/base-policy"

export class DatasetEntriesPolicy extends BasePolicy<DatasetEntry> {
  // TODO: move this code to a shared location, somewhere
  static applyScope(modelClass: ModelStatic<DatasetEntry>, user: User): ModelStatic<DatasetEntry> {
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
}

export default DatasetEntriesPolicy
