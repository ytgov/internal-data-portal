import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  CreationOptional,
  DataTypes,
  ForeignKey,
  HasManyAddAssociationMixin,
  HasManyAddAssociationsMixin,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyRemoveAssociationMixin,
  HasManyRemoveAssociationsMixin,
  HasManySetAssociationsMixin,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "sequelize"

import sequelize from "@/db/db-client"

import Dataset from "@/models/dataset"
import DatasetField from "@/models/dataset-field"

export class VisualizationControl extends Model<
  InferAttributes<VisualizationControl>,
  InferCreationAttributes<VisualizationControl>
> {
  declare id: CreationOptional<number>
  declare datasetId: ForeignKey<Dataset["id"]>
  declare isDownloadableAsCsv: CreationOptional<boolean>
  declare hasSearchCustomizations: CreationOptional<boolean>
  declare hasFieldsExcludedFromSearch: CreationOptional<boolean>
  declare hasSearchRowLimits: CreationOptional<boolean>
  declare searchRowLimitMaximum: CreationOptional<number | null>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date>

  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
  // https://sequelize.org/api/v7/types/_sequelize_core.index.belongstocreateassociationmixin
  declare getDataset: BelongsToGetAssociationMixin<Dataset>
  declare setDataset: BelongsToSetAssociationMixin<Dataset, Dataset["id"]>
  declare createDataset: BelongsToCreateAssociationMixin<Dataset>

  declare getSearchExcludedDatasetFields: HasManyGetAssociationsMixin<DatasetField>
  declare setSearchExcludedDatasetFields: HasManySetAssociationsMixin<
    DatasetField,
    DatasetField["datasetId"]
  >
  declare hasSearchExcludedDatasetField: HasManyHasAssociationMixin<
    DatasetField,
    DatasetField["datasetId"]
  >
  declare hasSearchExcludedDatasetFields: HasManyHasAssociationsMixin<
    DatasetField,
    DatasetField["datasetId"]
  >
  declare addSearchExcludedDatasetField: HasManyAddAssociationMixin<
    DatasetField,
    DatasetField["datasetId"]
  >
  declare addSearchExcludedDatasetFields: HasManyAddAssociationsMixin<
    DatasetField,
    DatasetField["datasetId"]
  >
  declare removeSearchExcludedDatasetField: HasManyRemoveAssociationMixin<
    DatasetField,
    DatasetField["datasetId"]
  >
  declare removeSearchExcludedDatasetFields: HasManyRemoveAssociationsMixin<
    DatasetField,
    DatasetField["datasetId"]
  >
  declare countSearchExcludedDatasetFields: HasManyCountAssociationsMixin
  declare createSearchExcludedDatasetField: HasManyCreateAssociationMixin<DatasetField>

  declare dataset?: NonAttribute<Dataset>
  declare searchExcludedDatasetFields?: NonAttribute<DatasetField[]>

  declare static associations: {
    dataset: Association<VisualizationControl, Dataset>
    searchExcludedDatasetFields: Association<VisualizationControl, DatasetField>
  }

  static establishAssociations() {
    this.belongsTo(Dataset, { as: "dataset" })
    this.hasMany(DatasetField, {
      as: "searchExcludedDatasetFields",
      sourceKey: "datasetId",
      foreignKey: "datasetId",
      scope: {
        isExcludedFromSearch: true,
      },
    })
  }
}

VisualizationControl.init(
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
    isDownloadableAsCsv: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    hasSearchCustomizations: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    hasFieldsExcludedFromSearch: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    hasSearchRowLimits: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    searchRowLimitMaximum: {
      type: DataTypes.INTEGER,
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
        fields: ["dataset_id"],
        name: "unique_visualization_controls_on_dataset_id",
        where: {
          deleted_at: null,
        },
      },
    ],
  }
)

export default VisualizationControl
