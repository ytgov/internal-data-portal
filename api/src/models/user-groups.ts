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
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
} from "sequelize"

import sequelize from "@/db/db-client"

export enum UserGroupTypes {
  DEPARTMENT = "department",
  DIVISION = "division",
  BRANCH = "branch",
  UNIT = "unit",
}

export class UserGroup extends Model<
  InferAttributes<UserGroup>,
  InferCreationAttributes<UserGroup>
> {
  static readonly Types = UserGroupTypes

  declare id: CreationOptional<number>
  declare parentId: ForeignKey<UserGroup["id"]>
  declare name: string
  declare type: string
  declare order: number
  declare lastDivisionDirectorySyncAt: Date | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date>

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

  declare parent?: NonAttribute<UserGroup>
  declare children?: NonAttribute<UserGroup[]>

  declare static associations: {
    parent: Association<UserGroup, UserGroup>
    children: Association<UserGroup, UserGroup>
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
