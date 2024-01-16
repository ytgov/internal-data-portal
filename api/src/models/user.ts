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
} from "sequelize"

import sequelize from "@/db/db-client"

import Role from "@/models/role"

export enum UserStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive",
}

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>
  declare auth0Subject: string
  declare email: string
  declare firstName: string | null
  declare lastName: string | null
  declare position: string | null
  declare department: string | null
  declare division: string | null
  declare branch: string | null
  declare unit: string | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date>

  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#foohasmanybar
  // https://sequelize.org/api/v7/types/_sequelize_core.index.hasmanyaddassociationmixin
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

  declare roles?: NonAttribute<Role[]>

  declare static associations: {
    roles: Association<User, Role>
  }

  static establishAssociations() {
    this.hasMany(Role, {
      sourceKey: "id",
      foreignKey: "userId",
      as: "roles",
    })
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
    department: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    division: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    branch: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING(100),
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
