import { Attributes, FindOptions, Op } from "sequelize"

import { DatasetEntry, User } from "@/models"
import { AccessTypes } from "@/models/access-grant"
import {
  datasetsAccessibleViaAccessGrantsBy,
  datasetsAccessibleViaOwner,
  datasetsWithApprovedAccessRequestsFor,
} from "@/models/datasets"

import { PolicyFactory } from "@/policies/base-policy"

export class DatasetEntriesPolicy extends PolicyFactory(DatasetEntry) {
  static policyScope(user: User): FindOptions<Attributes<DatasetEntry>> {
    if (user.isSystemAdmin || user.isBusinessAnalyst) {
      return {}
    }

    const datasetsAccessibleViaOpenAccessGrantsByUserQuery = datasetsAccessibleViaAccessGrantsBy(
      user,
      [AccessTypes.OPEN_ACCESS]
    )
    const datasetsWithApprovedAccessRequestsForUserQuery =
      datasetsWithApprovedAccessRequestsFor(user)
    if (user.isDataOwner) {
      const datasetsAccessibleViaOwnerQuery = datasetsAccessibleViaOwner(user)
      return {
        where: {
          datasetId: {
            [Op.or]: [
              { [Op.in]: datasetsAccessibleViaOwnerQuery },
              { [Op.in]: datasetsWithApprovedAccessRequestsForUserQuery },
              { [Op.in]: datasetsAccessibleViaOpenAccessGrantsByUserQuery },
            ],
          },
        },
      }
    }

    return {
      where: {
        datasetId: {
          [Op.or]: [
            { [Op.in]: datasetsWithApprovedAccessRequestsForUserQuery },
            { [Op.in]: datasetsAccessibleViaOpenAccessGrantsByUserQuery },
          ],
        },
      },
    }
  }
}

export default DatasetEntriesPolicy
