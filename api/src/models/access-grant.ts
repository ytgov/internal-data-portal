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
  Op,
} from "sequelize"

import sequelize from "@/db/db-client"

import Dataset from "@/models/dataset"
import User from "@/models/user"

export enum GrantLevels {
  GOVERNMENT_WIDE = "government_wide",
  DEPARTMENT = "department",
  DIVISION = "division",
  BRANCH = "branch",
  UNIT = "unit",
}

export enum AccessTypes {
  OPEN_ACCESS = "open_access",
  SELF_SERVE_ACCESS = "self_serve_access",
  SCREENED_ACCESS = "screened_access",
}

export class AccessGrant extends Model<
  InferAttributes<AccessGrant>,
  InferCreationAttributes<AccessGrant>
> {
  static readonly GrantLevels = GrantLevels
  static readonly AccessTypes = AccessTypes

  declare id: CreationOptional<number>
  declare datasetId: ForeignKey<Dataset["id"]>
  declare ownerId: ForeignKey<User["id"]>
  declare requestorId: ForeignKey<User["id"]>
  declare grantLevel: GrantLevels
  declare accessType: AccessTypes
  declare isProjectDescriptionRequired: boolean
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

  declare getRequestor: BelongsToGetAssociationMixin<User>
  declare setRequestor: BelongsToSetAssociationMixin<User, User["id"]>
  declare createRequestor: BelongsToCreateAssociationMixin<User>

  declare dataset?: NonAttribute<Dataset>
  declare owner?: NonAttribute<User>
  declare requestor?: NonAttribute<User>

  declare static associations: {
    dataset: Association<AccessGrant, Dataset>
    owner: Association<AccessGrant, User>
    requestor: Association<AccessGrant, User>
  }

  static establishAssociations() {
    this.belongsTo(Dataset)
    this.belongsTo(User, {
      foreignKey: "ownerId",
      as: "owner",
    })
    this.belongsTo(User, {
      foreignKey: "requestorId",
      as: "requestor",
    })
  }
}

AccessGrant.init(
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
    requestorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    grantLevel: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: [Object.values(GrantLevels)],
      },
    },
    accessType: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: [Object.values(AccessTypes)],
      },
    },
    isProjectDescriptionRequired: {
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
        fields: ["dataset_id", "grant_level", "access_type"],
        name: "unique_access_grants_on_dataset_id_and_grant_level_and_access_type",
        where: {
          deletedAt: null,
        },
      },
      {
        unique: true,
        fields: ["dataset_id", "requestor_id"],
        name: "unique_access_grants_on_dataset_id_and_requestor_id",
        where: {
          requestorId: { [Op.ne]: null },
          deletedAt: null,
        },
      },
    ],
  }
)

export default AccessGrant
