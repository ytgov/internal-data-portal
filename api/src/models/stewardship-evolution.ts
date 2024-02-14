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
import Dataset from "@/models/dataset"

/**
 * @deprecated in favor of `DatasetStewardship`.
 * Avoid removing before 2024-03-09, to help ensure all necessary migrations have been run
 * in all environments.
 */
export class StewardshipEvolution extends Model<
  InferAttributes<StewardshipEvolution>,
  InferCreationAttributes<StewardshipEvolution>
> {
  declare id: CreationOptional<number>
  declare datasetId: ForeignKey<Dataset["id"]>
  declare ownerId: ForeignKey<User["id"]>
  declare supportId: ForeignKey<User["id"]>
  declare ownerName: string
  declare ownerPosition: string
  declare supportName: string
  declare supportEmail: string
  declare supportPosition: string
  declare department: string
  declare division: CreationOptional<string | null>
  declare branch: CreationOptional<string | null>
  declare unit: CreationOptional<string | null>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date>

  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
  // https://sequelize.org/api/v7/types/_sequelize_core.index.belongstocreateassociationmixin
  declare getDataset: BelongsToGetAssociationMixin<Dataset>
  declare setDataset: BelongsToSetAssociationMixin<Dataset, Dataset["id"]>
  declare createDataset: BelongsToCreateAssociationMixin<Dataset>

  declare getOwner: BelongsToGetAssociationMixin<User>
  declare setOwner: BelongsToSetAssociationMixin<User, User["id"]>
  declare createOwner: BelongsToCreateAssociationMixin<User>

  declare getSupport: BelongsToGetAssociationMixin<User>
  declare setSupport: BelongsToSetAssociationMixin<User, User["id"]>
  declare createSupport: BelongsToCreateAssociationMixin<User>

  declare dataset?: NonAttribute<Dataset>
  declare owner?: NonAttribute<User>
  declare support?: NonAttribute<User>

  declare static associations: {
    dataset: Association<StewardshipEvolution, Dataset>
    owner: Association<StewardshipEvolution, User>
    support: Association<StewardshipEvolution, User>
  }

  static establishAssociations() {
    this.belongsTo(Dataset, { as: "dataset" })
    this.belongsTo(User, {
      foreignKey: "ownerId",
      as: "owner",
    })
    this.belongsTo(User, {
      foreignKey: "supportId",
      as: "support",
    })
  }
}

StewardshipEvolution.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    datasetId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "datasets",
        key: "id",
      },
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    supportId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    ownerName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    ownerPosition: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    supportName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    supportEmail: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    supportPosition: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    division: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    branch: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    unit: {
      type: DataTypes.STRING(255),
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

export default StewardshipEvolution
