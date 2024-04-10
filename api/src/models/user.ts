import {
  Association,
  CreationOptional,
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManySetAssociationsMixin,
  HasOneCreateAssociationMixin,
  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin,
  InferAttributes,
  InferCreationAttributes,
  NonAttribute,
  Op,
  col,
  fn,
  where,
} from "sequelize"
import { DateTime } from "luxon"

import sequelize from "@/db/db-client"

import AccessGrant from "@/models/access-grant"
import AccessRequest from "@/models/access-request"
import Role, { RoleTypes } from "@/models/role"
import UserGroup from "@/models/user-groups"
import UserGroupMembership from "@/models/user-group-membership"

import BaseModel from "@/models/base-model"

export class User extends BaseModel<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>
  declare auth0Subject: string | null
  declare email: string
  declare firstName: string | null
  declare lastName: string | null
  declare position: string | null
  declare lastSyncSuccessAt: Date | null
  declare lastSyncFailureAt: Date | null
  declare setupFromEmailFirstLogin: CreationOptional<boolean>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date | null>

  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#foohasmanybar
  // https://sequelize.org/api/v7/types/_sequelize_core.index.hasmanyaddassociationmixin
  declare getUserGroupMembership: HasOneGetAssociationMixin<UserGroupMembership>
  declare setUserGroupMembership: HasOneSetAssociationMixin<
    UserGroupMembership,
    UserGroupMembership["userId"]
  >
  declare createUserGroupMembership: HasOneCreateAssociationMixin<UserGroupMembership>

  declare getRoles: HasManyGetAssociationsMixin<Role>
  declare setRoles: HasManySetAssociationsMixin<Role, Role["userId"]>
  declare hasRole: HasManyHasAssociationMixin<Role, Role["userId"]>
  declare hasRoles: HasManyHasAssociationsMixin<Role, Role["userId"]>
  declare addRole: HasManyAddAssociationMixin<Role, Role["userId"]>
  declare addRoles: HasManyAddAssociationsMixin<Role, Role["userId"]>
  declare removeRole: HasManyRemoveAssociationMixin<Role, Role["userId"]>
  declare removeRoles: HasManyRemoveAssociationsMixin<Role, Role["userId"]>
  declare countRoles: HasManyCountAssociationsMixin
  declare createRole: HasManyCreateAssociationMixin<Role>

  declare getAccessGrants: HasManyGetAssociationsMixin<AccessGrant>
  declare setAccessGrants: HasManySetAssociationsMixin<AccessGrant, AccessGrant["creatorId"]>
  declare hasAccessGrant: HasManyHasAssociationMixin<AccessGrant, AccessGrant["creatorId"]>
  declare hasAccessGrants: HasManyHasAssociationsMixin<AccessGrant, AccessGrant["creatorId"]>
  declare addAccessGrant: HasManyAddAssociationMixin<AccessGrant, AccessGrant["creatorId"]>
  declare addAccessGrants: HasManyAddAssociationsMixin<AccessGrant, AccessGrant["creatorId"]>
  declare removeAccessGrant: HasManyRemoveAssociationMixin<AccessGrant, AccessGrant["creatorId"]>
  declare removeAccessGrants: HasManyRemoveAssociationsMixin<AccessGrant, AccessGrant["creatorId"]>
  declare countAccessGrants: HasManyCountAssociationsMixin
  declare createAccessGrants: HasManyCreateAssociationMixin<AccessGrant>

  declare getAccessGrantSupports: HasManyGetAssociationsMixin<AccessGrant>
  declare setAccessGrantSupports: HasManySetAssociationsMixin<AccessGrant, AccessGrant["supportId"]>
  declare hasAccessGrantSupport: HasManyHasAssociationMixin<AccessGrant, AccessGrant["supportId"]>
  declare hasAccessGrantSupports: HasManyHasAssociationsMixin<AccessGrant, AccessGrant["supportId"]>
  declare addAccessGrantSupport: HasManyAddAssociationMixin<AccessGrant, AccessGrant["supportId"]>
  declare addAccessGrantSupports: HasManyAddAssociationsMixin<AccessGrant, AccessGrant["supportId"]>
  declare removeAccessGrantSupport: HasManyRemoveAssociationMixin<
    AccessGrant,
    AccessGrant["supportId"]
  >
  declare removeAccessGrantSupports: HasManyRemoveAssociationsMixin<
    AccessGrant,
    AccessGrant["supportId"]
  >
  declare countAccessGrantSupports: HasManyCountAssociationsMixin
  declare createAccessGrantSupports: HasManyCreateAssociationMixin<AccessGrant>

  declare getAccessRequestsAsRequestor: HasManyGetAssociationsMixin<AccessRequest>
  declare setAccessRequestsAsRequestor: HasManySetAssociationsMixin<
    AccessRequest,
    AccessRequest["requestorId"]
  >
  declare hasAccessRequestAsRequestor: HasManyHasAssociationMixin<
    AccessRequest,
    AccessRequest["requestorId"]
  >
  declare hasAccessRequestsAsRequestor: HasManyHasAssociationsMixin<
    AccessRequest,
    AccessRequest["requestorId"]
  >
  declare addAccessRequestAsRequestor: HasManyAddAssociationMixin<
    AccessRequest,
    AccessRequest["requestorId"]
  >
  declare addAccessRequestsAsRequestor: HasManyAddAssociationsMixin<
    AccessRequest,
    AccessRequest["requestorId"]
  >
  declare removeAccessRequestAsRequestor: HasManyRemoveAssociationMixin<
    AccessRequest,
    AccessRequest["requestorId"]
  >
  declare removeAccessRequestsAsRequestor: HasManyRemoveAssociationsMixin<
    AccessRequest,
    AccessRequest["requestorId"]
  >
  declare countAccessRequestsAsRequestor: HasManyCountAssociationsMixin
  declare createAccessRequestsAsRequestor: HasManyCreateAssociationMixin<AccessRequest>

  declare groupMembership?: NonAttribute<UserGroupMembership>
  declare accessGrants?: NonAttribute<AccessGrant[]>
  declare accessGrantSupports?: NonAttribute<AccessGrant[]>
  declare accessRequestsAsRequestor?: NonAttribute<AccessRequest[]>
  declare roles?: NonAttribute<Role[]>

  declare static associations: {
    groupMembership: Association<User, UserGroupMembership>
    accessGrants: Association<User, AccessGrant>
    accessGrantSupports: Association<User, AccessGrant>
    accessRequestsAsRequestor: Association<User, AccessRequest>
    roles: Association<User, Role>
  }

  static establishAssociations() {
    this.hasOne(UserGroupMembership, {
      foreignKey: "userId",
      as: "groupMembership",
    })
    this.hasMany(Role, {
      sourceKey: "id",
      foreignKey: "userId",
      as: "roles",
    })
    this.hasMany(AccessGrant, {
      foreignKey: "creatorId",
      as: "accessGrants",
    })
    this.hasMany(AccessGrant, {
      foreignKey: "supportId",
      as: "accessGrantSupports",
    })
    this.hasMany(AccessRequest, {
      foreignKey: "requestorId",
      as: "accessRequestsAsRequestor",
    })
  }

  static byEmailIgnoreCase(email: string) {
    return this.scope({ method: ["byEmailIgnoreCase", email] })
  }

  get roleTypes(): NonAttribute<RoleTypes[]> {
    return this.roles?.map(({ role }) => role) || []
  }

  get isSystemAdmin(): NonAttribute<boolean> {
    return this.roleTypes.includes(RoleTypes.SYSTEM_ADMIN)
  }

  get isBusinessAnalyst(): NonAttribute<boolean> {
    return this.roleTypes.includes(RoleTypes.BUSINESS_ANALYST)
  }

  get isDataOwner(): NonAttribute<boolean> {
    return this.roleTypes.includes(RoleTypes.DATA_OWNER)
  }

  get department(): NonAttribute<UserGroup | undefined> {
    return this.groupMembership?.department
  }

  get division(): NonAttribute<UserGroup | undefined> {
    return this.groupMembership?.division
  }

  get branch(): NonAttribute<UserGroup | undefined> {
    return this.groupMembership?.branch
  }

  get unit(): NonAttribute<UserGroup | undefined> {
    return this.groupMembership?.unit
  }

  get displayName(): NonAttribute<string> {
    return `${this.firstName} ${this.lastName}`
  }

  /**
   * NOTE: Blocks sync if there was a sync failure, requires manual intervention
   * to re-enable syncing.
   */
  isTimeToSyncWithEmployeeDirectory(): NonAttribute<boolean> {
    if (this.lastSyncFailureAt !== null) {
      return false
    }

    if (this.lastSyncSuccessAt === null) {
      return true
    }

    const current = DateTime.utc()
    const lastSyncDate = DateTime.fromJSDate(this.lastSyncSuccessAt, { zone: "utc" })

    return !current.hasSame(lastSyncDate, "day")
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    auth0Subject: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    lastSyncSuccessAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastSyncFailureAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    setupFromEmailFirstLogin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    indexes: [
      {
        unique: true,
        fields: ["auth0_subject"],
        name: "unique_users_auth0_subject",
        where: {
          deleted_at: null,
        },
      },
      {
        unique: true,
        fields: ["email"],
        name: "unique_users_email",
        where: {
          deleted_at: null,
        },
      },
    ],
    scopes: {
      byEmailIgnoreCase: (email: string) => {
        return {
          where: where(fn("LOWER", col("email")), email.toLowerCase()),
        }
      },
      withPresenceOf(attributes: string[]) {
        if (attributes.length === 0) {
          throw new Error("Must provide at least one attribute to search for.")
        }

        const where = {
          [Op.or]: attributes.map((attribute) => ({
            [attribute]: {
              [Op.and]: [{ [Op.not]: null }, { [Op.ne]: "" }],
            },
          })),
        }

        return {
          where,
        }
      },
    },
  }
)

export default User
