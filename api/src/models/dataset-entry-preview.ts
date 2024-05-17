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
  NonAttribute,
  Op,
} from "sequelize"

import sequelize from "@/db/db-client"

import BaseModel from "@/models/base-model"
import Dataset from "@/models/dataset"
import DatasetEntry, { DatasetEntryJsonDataType } from "@/models/dataset-entry"

export class DatasetEntryPreview extends BaseModel<
  InferAttributes<DatasetEntryPreview>,
  InferCreationAttributes<DatasetEntryPreview>
> {
  declare id: CreationOptional<number>
  declare datasetId: ForeignKey<Dataset["id"]>
  declare datasetEntryId: ForeignKey<DatasetEntry["id"]>
  declare jsonData: DatasetEntryJsonDataType
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date | null>

  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
  // https://sequelize.org/api/v7/types/_sequelize_core.index.belongstocreateassociationmixin
  declare getDataset: BelongsToGetAssociationMixin<Dataset>
  declare setDataset: BelongsToSetAssociationMixin<Dataset, Dataset["id"]>
  declare createDataset: BelongsToCreateAssociationMixin<Dataset>

  declare getDatasetEntry: BelongsToGetAssociationMixin<DatasetEntry>
  declare setDatasetEntry: BelongsToSetAssociationMixin<DatasetEntry, DatasetEntry["id"]>
  declare createDatasetEntry: BelongsToCreateAssociationMixin<DatasetEntry>

  declare dataset?: NonAttribute<Dataset>
  declare datasetEntry?: NonAttribute<DatasetEntry>

  declare static associations: {
    dataset: Association<DatasetEntryPreview, Dataset>
    datasetEntry: Association<DatasetEntryPreview, DatasetEntry>
  }

  static establishAssociations() {
    this.belongsTo(Dataset, { as: "dataset" })
    this.belongsTo(DatasetEntry, { as: "datasetEntry" })
  }
}

DatasetEntryPreview.init(
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
    datasetEntryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: DatasetEntry,
        key: "id",
      },
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
      {
        unique: true,
        fields: ["dataset_entry_id"],
        where: {
          deleted_at: {
            [Op.is]: null,
          },
        },
      },
    ],
  }
)

export default DatasetEntryPreview
