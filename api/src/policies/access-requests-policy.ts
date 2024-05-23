import { Attributes, FindOptions, NonAttribute } from "sequelize"
import { isNil } from "lodash"

import { Path } from "@/utils/deep-pick"
import { Dataset, AccessRequest, User, UserGroupMembership, UserGroup, AccessGrant } from "@/models"
import { PolicyFactory } from "@/policies/base-policy"
import DatasetsPolicy from "@/policies/datasets-policy"

export type AccessRequestWithDataset = AccessRequest & { dataset: NonAttribute<Dataset> }
export type AccessRequestForCreate = AccessRequest & {
  dataset: NonAttribute<Dataset> & {
    owner: NonAttribute<User> & {
      groupMembership: NonAttribute<UserGroupMembership> & {
        department: NonAttribute<UserGroup>
        division: NonAttribute<UserGroup>
        branch: NonAttribute<UserGroup>
        unit: NonAttribute<UserGroup>
      }
    }
    acessGrants: NonAttribute<AccessGrant[]>
  }
}

export class AccessRequestsPolicy extends PolicyFactory<
  AccessRequest,
  AccessRequestWithDataset | AccessRequestForCreate
>(AccessRequest) {
  private readonly datasetsPolicy: DatasetsPolicy

  constructor(user: User, record: AccessRequestWithDataset | AccessRequestForCreate) {
    super(user, record)
    this.datasetsPolicy = new DatasetsPolicy(this.user, this.record.dataset)
  }

  create(): boolean {
    if (this.user.isSystemAdmin || this.user.isBusinessAnalyst) return true
    if (this.record.requestorId !== this.user.id) return false

    const expectedAccessGrant = this.record.dataset?.mostPermissiveAccessGrantFor(this.user)
    if (isNil(expectedAccessGrant)) return false
    if (this.record.accessGrantId !== expectedAccessGrant.id) return false

    return this.datasetsPolicy.show()
  }

  update(): boolean {
    return this.datasetsPolicy.update()
  }

  static policyScope(user: User): FindOptions<Attributes<AccessRequest>> {
    if (user.isSystemAdmin || user.isBusinessAnalyst) {
      return {}
    }

    if (user.isDataOwner) {
      return {
        include: [
          {
            association: "dataset",
            where: {
              ownerId: user.id,
            },
          },
        ],
      }
    }

    return {
      where: {
        requestorId: user.id,
      },
    }
  }

  permittedAttributesForUpdate(): Path[] {
    return ["denialReason"]
  }

  permittedAttributesForCreate(): Path[] {
    return ["datasetId", "requestorId", "accessGrantId", "projectName", "projectDescription"]
  }
}

export default AccessRequestsPolicy
