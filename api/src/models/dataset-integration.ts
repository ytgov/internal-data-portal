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

import Dataset from "@/models/dataset"

// Keep in sync with web/src/api/dataset-fields-api.ts
export enum DatasetIntegrationStatusTypes {
  OK = "ok",
  ERRORED = "errored",
}

export class DatasetIntegration extends Model<
  InferAttributes<DatasetIntegration>,
  InferCreationAttributes<DatasetIntegration>
> {
  static readonly StatusTypes = DatasetIntegrationStatusTypes

  declare id: CreationOptional<number>
  declare datasetId: ForeignKey<Dataset["id"]>
  declare url: string
  declare headerKey: CreationOptional<string | null>
  declare headerValue: CreationOptional<string | null>
  declare jmesPathTransform: CreationOptional<string | null>
  declare rawJsonData: CreationOptional<string | null>
  declare parsedJsonData: CreationOptional<string | null>
  declare status: string
  declare errorCode: CreationOptional<string | null>
  declare errorDetails: CreationOptional<string | null>
  declare lastSuccessAt: CreationOptional<Date | null>
  declare lastFailureAt: CreationOptional<Date | null>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date>

  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
  // https://sequelize.org/api/v7/types/_sequelize_core.index.belongstocreateassociationmixin
  declare getDataset: BelongsToGetAssociationMixin<Dataset>
  declare setDataset: BelongsToSetAssociationMixin<Dataset, Dataset["id"]>
  declare createDataset: BelongsToCreateAssociationMixin<Dataset>

  declare dataset?: NonAttribute<Dataset>

  declare static associations: {
    dataset: Association<DatasetIntegration, Dataset>
  }

  static establishAssociations() {
    this.belongsTo(Dataset, { as: "dataset" })
  }
}

DatasetIntegration.init(
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
        model: Dataset,
        key: "id",
      },
    },
    url: {
      type: DataTypes.STRING(1024),
      allowNull: false,
    },
    headerKey: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
    headerValue: {
      type: DataTypes.STRING(4000),
      allowNull: true,
    },
    jmesPathTransform: {
      type: DataTypes.STRING(1024),
      allowNull: true,
    },
    rawJsonData: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    parsedJsonData: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    errorCode: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    errorDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lastSuccessAt: {
      type: DataTypes.NOW,
      allowNull: true,
    },
    lastFailureAt: {
      type: DataTypes.NOW,
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

export default DatasetIntegration
