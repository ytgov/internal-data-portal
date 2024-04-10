import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "sequelize"

import sequelize from "@/db/db-client"

import User from "@/models/user"

export enum RoleTypes {
  USER = "user",
  DATA_OWNER = "data_owner",
  BUSINESS_ANALYST = "business_analyst",
  SYSTEM_ADMIN = "system_admin",
}

export class Role extends Model<InferAttributes<Role>, InferCreationAttributes<Role>> {
  static readonly Types = RoleTypes

  declare id: CreationOptional<number>
  declare userId: ForeignKey<User["id"]>
  declare role: RoleTypes
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date | null>

  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
  // https://sequelize.org/api/v7/types/_sequelize_core.index.belongstocreateassociationmixin
  declare getUser: BelongsToGetAssociationMixin<User>
  declare setUser: BelongsToSetAssociationMixin<User, User["id"]>
  declare createUser: BelongsToCreateAssociationMixin<User>

  declare user?: NonAttribute<User>

  declare static associations: {
    user: Association<Role, User>
  }

  static establishAssociations() {
    this.belongsTo(User, { as: "user" })
  }
}

Role.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    role: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isIn: [Object.values(RoleTypes)],
      },
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
        fields: ["user_id", "role"],
        name: "unique_roles_user_id_name",
        where: {
          deleted_at: null,
        },
      },
    ],
  }
)

export default Role
