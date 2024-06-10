import {
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
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
} from "sequelize"

import sequelize from "@/db/db-client"
import UserGroupMembership from "@/models/user-group-membership"
import BaseModel from "@/models/base-model"

export enum UserGroupTypes {
  DEPARTMENT = "department",
  DIVISION = "division",
  BRANCH = "branch",
  UNIT = "unit",
}

export const UNASSIGNED_USER_GROUP_NAME = "Unassigned"
export const UNASSIGNED_USER_GROUP_ACRONYM = "U"
export const DEFAULT_ORDER = -1

export class UserGroup extends BaseModel<
  InferAttributes<UserGroup>,
  InferCreationAttributes<UserGroup>
> {
  static readonly Types = UserGroupTypes

  declare id: CreationOptional<number>
  declare parentId: ForeignKey<UserGroup["id"]> | null
  declare type: string
  declare name: string
  declare acronym: string
  declare order: number
  declare lastDivisionDirectorySyncAt: Date | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date | null>

  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#foohasmanybar
  // https://sequelize.org/api/v7/types/_sequelize_core.index.hasmanyaddassociationmixin
  declare getParent: BelongsToGetAssociationMixin<UserGroup>
  declare setParent: BelongsToSetAssociationMixin<UserGroup, UserGroup["id"]>
  declare createParent: BelongsToCreateAssociationMixin<UserGroup>

  declare getChildren: HasManyGetAssociationsMixin<UserGroup>
  declare setChildren: HasManySetAssociationsMixin<UserGroup, UserGroup["parentId"]>
  declare hasChild: HasManyHasAssociationMixin<UserGroup, UserGroup["parentId"]>
  declare hasChildren: HasManyHasAssociationsMixin<UserGroup, UserGroup["parentId"]>
  declare addChild: HasManyAddAssociationMixin<UserGroup, UserGroup["parentId"]>
  declare addChildren: HasManyAddAssociationsMixin<UserGroup, UserGroup["parentId"]>
  declare removeChild: HasManyRemoveAssociationMixin<UserGroup, UserGroup["parentId"]>
  declare removeChildren: HasManyRemoveAssociationsMixin<UserGroup, UserGroup["parentId"]>
  declare countChildren: HasManyCountAssociationsMixin
  declare createChild: HasManyCreateAssociationMixin<UserGroup>

  declare getDepartmentMemberships: HasManyGetAssociationsMixin<UserGroupMembership>
  declare setDepartmentMemberships: HasManySetAssociationsMixin<
    UserGroupMembership,
    UserGroupMembership["departmentId"]
  >
  declare hasDepartmentMembership: HasManyAddAssociationMixin<
    UserGroupMembership,
    UserGroupMembership["departmentId"]
  >
  declare hasDepartmentMemberships: HasManyAddAssociationsMixin<
    UserGroupMembership,
    UserGroupMembership["departmentId"]
  >
  declare addDepartmentMembership: HasManyAddAssociationMixin<
    UserGroupMembership,
    UserGroupMembership["departmentId"]
  >
  declare addDepartmentMemberships: HasManyAddAssociationsMixin<
    UserGroupMembership,
    UserGroupMembership["departmentId"]
  >
  declare removeDepartmentMembership: HasManyRemoveAssociationMixin<
    UserGroupMembership,
    UserGroupMembership["departmentId"]
  >
  declare removeDepartmentMemberships: HasManyRemoveAssociationsMixin<
    UserGroupMembership,
    UserGroupMembership["departmentId"]
  >
  declare countDepartmentMemberships: HasManyCountAssociationsMixin
  declare createDepartmentMembership: HasManyCreateAssociationMixin<UserGroupMembership>

  declare getDivisionMemberships: HasManyGetAssociationsMixin<UserGroupMembership>
  declare setDivisionMemberships: HasManySetAssociationsMixin<
    UserGroupMembership,
    UserGroupMembership["divisionId"]
  >
  declare hasDivisionMembership: HasManyAddAssociationMixin<
    UserGroupMembership,
    UserGroupMembership["divisionId"]
  >
  declare hasDivisionMemberships: HasManyAddAssociationsMixin<
    UserGroupMembership,
    UserGroupMembership["divisionId"]
  >
  declare addDivisionMembership: HasManyAddAssociationMixin<
    UserGroupMembership,
    UserGroupMembership["divisionId"]
  >
  declare addDivisionMemberships: HasManyAddAssociationsMixin<
    UserGroupMembership,
    UserGroupMembership["divisionId"]
  >
  declare removeDivisionMembership: HasManyRemoveAssociationMixin<
    UserGroupMembership,
    UserGroupMembership["divisionId"]
  >
  declare removeDivisionMemberships: HasManyRemoveAssociationsMixin<
    UserGroupMembership,
    UserGroupMembership["divisionId"]
  >
  declare countDivisionMemberships: HasManyCountAssociationsMixin
  declare createDivisionMembership: HasManyCreateAssociationMixin<UserGroupMembership>

  declare getBranchMemberships: HasManyGetAssociationsMixin<UserGroupMembership>
  declare setBranchMemberships: HasManySetAssociationsMixin<
    UserGroupMembership,
    UserGroupMembership["branchId"]
  >
  declare hasBranchMembership: HasManyAddAssociationMixin<
    UserGroupMembership,
    UserGroupMembership["branchId"]
  >
  declare hasBranchMemberships: HasManyAddAssociationsMixin<
    UserGroupMembership,
    UserGroupMembership["branchId"]
  >
  declare addBranchMembership: HasManyAddAssociationMixin<
    UserGroupMembership,
    UserGroupMembership["branchId"]
  >
  declare addBranchMemberships: HasManyAddAssociationsMixin<
    UserGroupMembership,
    UserGroupMembership["branchId"]
  >
  declare removeBranchMembership: HasManyRemoveAssociationMixin<
    UserGroupMembership,
    UserGroupMembership["branchId"]
  >
  declare removeBranchMemberships: HasManyRemoveAssociationsMixin<
    UserGroupMembership,
    UserGroupMembership["branchId"]
  >
  declare countBranchMemberships: HasManyCountAssociationsMixin
  declare createBranchMembership: HasManyCreateAssociationMixin<UserGroupMembership>

  declare getUnitMemberships: HasManyGetAssociationsMixin<UserGroupMembership>
  declare setUnitMemberships: HasManySetAssociationsMixin<
    UserGroupMembership,
    UserGroupMembership["unitId"]
  >
  declare hasUnitMembership: HasManyAddAssociationMixin<
    UserGroupMembership,
    UserGroupMembership["unitId"]
  >
  declare hasUnitMemberships: HasManyAddAssociationsMixin<
    UserGroupMembership,
    UserGroupMembership["unitId"]
  >
  declare addUnitMembership: HasManyAddAssociationMixin<
    UserGroupMembership,
    UserGroupMembership["unitId"]
  >
  declare addUnitMemberships: HasManyAddAssociationsMixin<
    UserGroupMembership,
    UserGroupMembership["unitId"]
  >
  declare removeUnitMembership: HasManyRemoveAssociationMixin<
    UserGroupMembership,
    UserGroupMembership["unitId"]
  >
  declare removeUnitMemberships: HasManyRemoveAssociationsMixin<
    UserGroupMembership,
    UserGroupMembership["unitId"]
  >
  declare countUnitMemberships: HasManyCountAssociationsMixin
  declare createUnitMembership: HasManyCreateAssociationMixin<UserGroupMembership>

  declare parent?: NonAttribute<UserGroup>
  declare children?: NonAttribute<UserGroup[]>
  declare departmentMemberships?: NonAttribute<UserGroupMembership[]>
  declare divisionMemberships?: NonAttribute<UserGroupMembership[]>
  declare branchMemberships?: NonAttribute<UserGroupMembership[]>
  declare unitMemberships?: NonAttribute<UserGroupMembership[]>

  declare static associations: {
    parent: Association<UserGroup, UserGroup>
    children: Association<UserGroup, UserGroup>
    departmentMemberships: Association<UserGroup, UserGroupMembership>
    divisionMemberships: Association<UserGroup, UserGroupMembership>
    branchMemberships: Association<UserGroup, UserGroupMembership>
    unitMemberships: Association<UserGroup, UserGroupMembership>
  }

  static establishAssociations() {
    this.belongsTo(UserGroup, {
      foreignKey: "parentId",
      as: "parent",
    })
    this.hasMany(UserGroup, {
      sourceKey: "id",
      foreignKey: "parentId",
      as: "children",
    })
    this.hasMany(UserGroupMembership, {
      sourceKey: "id",
      foreignKey: "departmentId",
      as: "departmentMemberships",
    })
    this.hasMany(UserGroupMembership, {
      sourceKey: "id",
      foreignKey: "divisionId",
      as: "divisionMemberships",
    })
    this.hasMany(UserGroupMembership, {
      sourceKey: "id",
      foreignKey: "branchId",
      as: "branchMemberships",
    })
    this.hasMany(UserGroupMembership, {
      sourceKey: "id",
      foreignKey: "unitId",
      as: "unitMemberships",
    })
  }
}

UserGroup.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    // null for top level of hierarchy
    parentId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "user_groups",
        key: "id",
      },
    },
    // enum of "department", "division", "branch", "unit"
    type: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: [Object.values(UserGroupTypes)],
      },
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    acronym: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    lastDivisionDirectorySyncAt: {
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
  }
)

export default UserGroup
