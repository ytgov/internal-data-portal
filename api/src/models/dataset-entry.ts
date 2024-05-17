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
import { isEmpty } from "lodash"

import sequelize from "@/db/db-client"

import Dataset from "@/models/dataset"
import { datasetEntriesSearch } from "@/models/dataset-entries"
import BaseModel from "@/models/base-model"

export type DatasetEntryRawJsonDataType = Record<string, unknown>
export type DatasetEntryJsonDataType = Record<string, string | number>

export class DatasetEntry extends BaseModel<
  InferAttributes<DatasetEntry>,
  InferCreationAttributes<DatasetEntry>
> {
  declare id: CreationOptional<number>
  declare datasetId: ForeignKey<Dataset["id"]>
  declare rawJsonData: DatasetEntryRawJsonDataType
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
      get() {
        const value = this.getDataValue("rawJsonData") as unknown as string
        return JSON.parse(value)
      },
      set(value: string) {
        this.setDataValue(
          "rawJsonData",
          JSON.stringify(value) as unknown as DatasetEntryRawJsonDataType
        )
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
    ],
    scopes: {
      search(searchToken: string) {
        if (isEmpty(searchToken)) {
          return {}
        }

        return {
          where: {
            id: {
              [Op.in]: datasetEntriesSearch(),
            },
          },
          replacements: {
            searchTokenWildcard: `%${searchToken}%`,
            searchToken,
          },
        }
      },
    },
  }
)

export default DatasetEntry
