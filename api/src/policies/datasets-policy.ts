import { ModelStatic, Op, literal } from "sequelize"
import { isNil } from "lodash"

import { Path } from "@/utils/deep-pick"
import { Dataset, User, AccessGrant } from "@/models"
import { AccessTypes } from "@/models/access-grant"
import BasePolicy from "@/policies/base-policy"
import { accessibleViaAccessGrantsBy } from "@/models/datasets"

export class DatasetsPolicy extends BasePolicy<Dataset> {
  private _mostPermissiveAccessGrant: AccessGrant | null = null

  constructor(user: User, record: Dataset) {
    super(user, record)
  }

  show(): boolean {
    if (this.user.isSystemAdmin || this.user.isBusinessAnalyst) {
      return true
    } else if (this.user.isDataOwner && this.record.ownerId === this.user.id) {
      return true
    } else if (
      [
        AccessTypes.OPEN_ACCESS,
        AccessTypes.SELF_SERVE_ACCESS,
        AccessTypes.SCREENED_ACCESS,
      ].includes(this.userAccessType())
    ) {
      return true
    }

    return false
  }

  create(): boolean {
    if (this.user.isSystemAdmin || this.user.isBusinessAnalyst) {
      return true
    } else if (this.user.isDataOwner && this.record.ownerId === this.user.id) {
      return true
    }

    return false
  }

  update(): boolean {
    if (this.user.isSystemAdmin || this.user.isBusinessAnalyst) {
      return true
    } else if (this.user.isDataOwner && this.record.ownerId === this.user.id) {
      return true
    }

    return false
  }

  static applyScope(modelClass: ModelStatic<Dataset>, user: User): ModelStatic<Dataset> {
    if (user.isSystemAdmin || user.isBusinessAnalyst) {
      return modelClass
    }

    if (user.isDataOwner) {
      const accessibleAccessGrantsQuery = accessibleViaAccessGrantsBy(user)
      const ownerQuery = literal(
        `
        (
          SELECT
            datasets.id
          FROM
            datasets
          WHERE datasets.owner_id = ${user.id}
        )
        `
      )
      return modelClass.scope({
        where: {
          id: {
            [Op.or]: [{ [Op.in]: ownerQuery }, { [Op.in]: accessibleAccessGrantsQuery }],
          },
        },
      })
    }

    return modelClass.scope({ method: ["accessibleViaAccessGrantsBy", user] })
  }

  permittedAttributes(): Path[] {
    return [
      ...(this.user.isSystemAdmin || this.user.isBusinessAnalyst ? ["ownerId"] : []),
      "name",
      "description",
      "subscriptionUrl",
      "subscriptionAccessCode",
      "isSpatialData",
      "isLiveData",
      "termsOfUse",
      "credits",
      "ownerNotes",

      // stateful attributes - maybe should require a stateful controller endpoint to update?
      "deactivatedAt",
      "publishedAt",
    ]
  }

  permittedAttributesForCreate(): Path[] {
    return [
      ...this.permittedAttributes(),
      {
        stewardshipAttributes: [
          "ownerId",
          "supportId",
          "departmentId",
          "divisionId",
          "branchId",
          "unitId",
        ],
      },
    ]
  }

  public userAccessType(): AccessTypes {
    const accessGrant = this.mostPermissiveAccessGrant()
    if (!isNil(accessGrant)) {
      return accessGrant.accessType
    }
    return AccessTypes.NO_ACCESS
  }

  public mostPermissiveAccessGrant(): AccessGrant | null {
    if (this._mostPermissiveAccessGrant === null) {
      this._mostPermissiveAccessGrant = this.record.mostPermissiveAccessGrantFor(this.user)
    }

    return this._mostPermissiveAccessGrant
  }
}

export default DatasetsPolicy
