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
export enum DatasetFieldDataTypes {
  INTEGER = "integer",
  TEXT = "text",
}

export class DatasetField extends Model<
  InferAttributes<DatasetField>,
  InferCreationAttributes<DatasetField>
> {
  static readonly DataTypes = DatasetFieldDataTypes

  declare id: CreationOptional<number>
  declare datasetId: ForeignKey<Dataset>
  declare name: string
  declare displayName: string
  declare dataType: DatasetFieldDataTypes
  declare description: CreationOptional<string | null>
  declare note: CreationOptional<string | null>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date>

  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
  // https://sequelize.org/api/v7/types/_sequelize_core.index.belongstocreateassociationmixin
  declare getDatasets: BelongsToGetAssociationMixin<Dataset>
  declare setDatasets: BelongsToSetAssociationMixin<Dataset, Dataset["id"]>
  declare createDataset: BelongsToCreateAssociationMixin<Dataset>

  declare dataset?: NonAttribute<Dataset>

  declare static associations: {
    dataset: Association<DatasetField, Dataset>
  }

  static establishAssociations() {
    this.belongsTo(Dataset, {
      as: "dataset",
    })
  }
}

DatasetField.init(
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    displayName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    dataType: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: [Object.values(DatasetFieldDataTypes)],
      },
    },
    description: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
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
        fields: ["dataset_id", "name"],
        name: "unique_dataset_fields_on_dataset_id_and_name",
        where: {
          deleted_at: null,
        },
      },
      {
        unique: true,
        fields: ["dataset_id", "display_name"],
        name: "unique_dataset_fields_on_dataset_id_and_display_name",
        where: {
          deleted_at: null,
        },
      },
    ],
  }
)

export default DatasetField
