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
import { activate, applyJMESPathTransform } from "@/models/dataset-integrations"

// Keep in sync with web/src/api/dataset-fields-api.ts
export enum DatasetIntegrationStatusTypes {
  OK = "ok",
  ERRORED = "errored",
  PENDING = "pending",
}

export type DatasetIntegrationRawJsonDataType = Record<string, unknown>
export type DatasetIntegrationParsedJsonDataType = Record<string, unknown>[]

export const MAX_RECORDS = 100 // TODO: consider making this configurable?

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
  declare rawJsonData: CreationOptional<DatasetIntegrationRawJsonDataType | null>
  declare parsedJsonData: CreationOptional<DatasetIntegrationParsedJsonDataType | null>
  declare status: DatasetIntegrationStatusTypes
  declare errorCode: CreationOptional<string | null>
  declare errorDetails: CreationOptional<string | null>
  declare estimatedSizeInBytes: CreationOptional<number | null>
  declare estimatedNumberOfRecords: CreationOptional<number | null>
  declare estimatedResponseTimeInMs: CreationOptional<number | null>
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

  async activate(
    this: DatasetIntegration
  ): Promise<NonAttribute<DatasetIntegrationRawJsonDataType>> {
    return activate(this)
  }

  async refresh(
    this: DatasetIntegration
  ): Promise<NonAttribute<DatasetIntegrationRawJsonDataType>> {
    return this.activate()
  }

  async applyJMESPathTransform(
    this: DatasetIntegration
  ): Promise<NonAttribute<DatasetIntegration>> {
    return applyJMESPathTransform(this)
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
      get() {
        const value = this.getDataValue("rawJsonData") as unknown as string
        return JSON.parse(value)
      },
      set(value: string) {
        this.setDataValue(
          "rawJsonData",
          JSON.stringify(value) as unknown as DatasetIntegrationRawJsonDataType
        )
      },
    },
    parsedJsonData: {
      type: DataTypes.TEXT,
      allowNull: true,
      get() {
        const value = this.getDataValue("parsedJsonData") as unknown as string
        return JSON.parse(value)
      },
      set(value: string) {
        this.setDataValue(
          "parsedJsonData",
          JSON.stringify(value) as unknown as DatasetIntegrationParsedJsonDataType
        )
      },
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
    estimatedSizeInBytes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    estimatedNumberOfRecords: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    estimatedResponseTimeInMs: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    lastSuccessAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    lastFailureAt: {
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

export default DatasetIntegration
