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
import { DatasetFieldDataTypes } from "@/models/dataset-field"

export type DatasetEntryJsonDataType = Record<string, DatasetFieldDataTypes>

export class DatasetEntry extends Model<
  InferAttributes<DatasetEntry>,
  InferCreationAttributes<DatasetEntry>
> {
  declare id: CreationOptional<number>
  declare datasetId: ForeignKey<Dataset["id"]>
  declare rawJsonData: string
  declare jsonData: DatasetEntryJsonDataType
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
    dataset: Association<DatasetEntry, Dataset>
  }

  static establishAssociations() {
    this.belongsTo(Dataset, { as: "dataset" })
  }
}

DatasetEntry.init(
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
    rawJsonData: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    jsonData: {
      type: DataTypes.TEXT,
      allowNull: false,
      get() {
        const value = this.getDataValue("jsonData") as unknown as string
        return JSON.parse(value)
      },
      set(value: string) {
        // TODO: assert value matches schema
        this.setDataValue("jsonData", JSON.stringify(value) as unknown as DatasetEntryJsonDataType)
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
        fields: ["datasetId"],
      },
    ],
  }
)

export default DatasetEntry
