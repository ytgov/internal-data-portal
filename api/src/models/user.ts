import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
  Association,
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManySetAssociationsMixin,
  ForeignKey,
  HasOneGetAssociationMixin,
  HasOneSetAssociationMixin,
  HasOneCreateAssociationMixin,
} from "sequelize"
import { DateTime } from "luxon"

import sequelize from "@/db/db-client"

import AccessGrant from "@/models/access-grant"
import Role, { RoleTypes } from "@/models/role"
import UserGroup from "@/models/user-groups"
import UserGroupMembership from "@/models/user-group-membership"

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>
  declare auth0Subject: string
  declare email: string
  declare firstName: string | null
  declare lastName: string | null
  declare position: string | null
  declare departmentId: ForeignKey<UserGroup["id"]>
  declare divisionId: ForeignKey<UserGroup["id"]>
  declare branchId: ForeignKey<UserGroup["id"]>
  declare unitId: ForeignKey<UserGroup["id"]>
  declare lastEmployeeDirectorySyncAt: Date | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date>

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

  declare getAccessGrantOwnerships: HasManyGetAssociationsMixin<AccessGrant>
  declare setAccessGrantOwnerships: HasManySetAssociationsMixin<AccessGrant, AccessGrant["ownerId"]>
  declare hasAccessGrantOwnership: HasManyHasAssociationMixin<AccessGrant, AccessGrant["ownerId"]>
  declare hasAccessGrantOwnerships: HasManyHasAssociationsMixin<AccessGrant, AccessGrant["ownerId"]>
  declare addAccessGrantOwnership: HasManyAddAssociationMixin<AccessGrant, AccessGrant["ownerId"]>
  declare addAccessGrantOwnerships: HasManyAddAssociationsMixin<AccessGrant, AccessGrant["ownerId"]>
  declare removeAccessGrantOwnership: HasManyRemoveAssociationMixin<AccessGrant, AccessGrant["ownerId"]>
  declare removeAccessGrantOwnerships: HasManyRemoveAssociationsMixin<AccessGrant, AccessGrant["ownerId"]>
  declare countAccessGrantOwnerships: HasManyCountAssociationsMixin
  declare createAccessGrantOwnerships: HasManyCreateAssociationMixin<AccessGrant>

  declare getAccessGrantRequests: HasManyGetAssociationsMixin<AccessGrant>
  declare setAccessGrantRequests: HasManySetAssociationsMixin<AccessGrant, AccessGrant["requestorId"]>
  declare hasAccessGrantRequest: HasManyHasAssociationMixin<AccessGrant, AccessGrant["requestorId"]>
  declare hasAccessGrantRequests: HasManyHasAssociationsMixin<AccessGrant, AccessGrant["requestorId"]>
  declare addAccessGrantRequest: HasManyAddAssociationMixin<AccessGrant, AccessGrant["requestorId"]>
  declare addAccessGrantRequests: HasManyAddAssociationsMixin<AccessGrant, AccessGrant["requestorId"]>
  declare removeAccessGrantRequest: HasManyRemoveAssociationMixin<AccessGrant, AccessGrant["requestorId"]>
  declare removeAccessGrantRequests: HasManyRemoveAssociationsMixin<AccessGrant, AccessGrant["requestorId"]>
  declare countAccessGrantRequests: HasManyCountAssociationsMixin
  declare createAccessGrantRequests: HasManyCreateAssociationMixin<AccessGrant>

  declare groupMembership?: NonAttribute<UserGroupMembership>
  declare accessGrantOwnerships?: NonAttribute<AccessGrant[]>
  declare accessGrantRequests?: NonAttribute<AccessGrant[]>
  declare roles?: NonAttribute<Role[]>

  declare static associations: {
    groupMembership: Association<User, UserGroupMembership>
    accessGrantOwnerships: Association<User, AccessGrant>
    accessGrantRequests: Association<User, AccessGrant>
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
      foreignKey: "ownerId",
      as: "accessGrantOwnerships",
    })
    this.hasMany(AccessGrant, {
      foreignKey: "requestorId",
      as: "accessGrantRequests",
    })
  }

  get roleTypes(): NonAttribute<RoleTypes[]> {
    return this.roles?.map(({ role }) => role) || []
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

  isTimeToSyncWithEmployeeDirectory(): NonAttribute<boolean> {
    if (this.lastEmployeeDirectorySyncAt === null) {
      return true
    }

    const current = DateTime.utc()
    const lastSyncDate = DateTime.fromJSDate(this.lastEmployeeDirectorySyncAt, { zone: "utc" })

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
      allowNull: false,
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
    lastEmployeeDirectorySyncAt: {
      type: DataTypes.DATE,
      allowNull: true,
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
  }
)

export default User
