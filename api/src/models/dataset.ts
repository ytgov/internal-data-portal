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

export enum DatasetErrorTypes {
  OK = "ok",
  ERRORED = "errored",
}

export class Dataset extends Model<InferAttributes<Dataset>, InferCreationAttributes<Dataset>> {
  static readonly ErrorTypes = DatasetErrorTypes

  declare id: CreationOptional<number>
  declare ownerId: ForeignKey<User["id"]>
  declare creatorId: ForeignKey<User["id"]>
  declare slug: string
  declare name: string
  declare description: string
  declare subscriptionUrl: CreationOptional<string>
  declare subscriptionAccessCode: CreationOptional<string>
  declare isSubscribable: CreationOptional<boolean>
  declare isSpatialData: CreationOptional<boolean>
  declare isLiveData: CreationOptional<boolean>
  declare termsOfUse: CreationOptional<string>
  declare credits: CreationOptional<string>
  declare ownerNotes: CreationOptional<string>
  declare status: CreationOptional<DatasetErrorTypes>
  declare errorCode: CreationOptional<string>
  declare errorDetails: CreationOptional<string>
  declare publishedAt: CreationOptional<Date>
  declare deactivatedAt: CreationOptional<Date>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date>

  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
  // https://sequelize.org/api/v7/types/_sequelize_core.index.belongstocreateassociationmixin
  declare getOwner: BelongsToGetAssociationMixin<User>
  declare setOwner: BelongsToSetAssociationMixin<User, User["id"]>
  declare createOwner: BelongsToCreateAssociationMixin<User>

  declare getCreator: BelongsToGetAssociationMixin<User>
  declare setCreator: BelongsToSetAssociationMixin<User, User["id"]>
  declare createCreator: BelongsToCreateAssociationMixin<User>

  declare owner?: NonAttribute<User>
  declare creator?: NonAttribute<User>

  declare static associations: {
    owner: Association<Dataset, User>
    creator: Association<Dataset, User>
  }

  static establishAssociations() {
    this.belongsTo(User, {
      foreignKey: "ownerId",
      as: "owner",
    })
    this.belongsTo(User, {
      foreignKey: "creatorId",
      as: "creator",
    })
  }
}

Dataset.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    subscriptionUrl: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    subscriptionAccessCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isSubscribable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isSpatialData: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isLiveData: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    termsOfUse: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    credits: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ownerNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: DatasetErrorTypes.OK,
      validate: {
        isIn: [Object.values(DatasetErrorTypes)],
      },
    },
    errorCode: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    errorDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deactivatedAt: {
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
        fields: ["slug"],
        name: "unique_datasets_slug",
        where: {
          deleted_at: null,
        },
      },
    ],
  }
)

export default Dataset
