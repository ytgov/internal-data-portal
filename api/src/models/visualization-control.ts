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
  declare hasPreview: CreationOptional<boolean>
  declare hasFieldsExcludedFromPreview: CreationOptional<boolean>
  declare hasPreviewRowLimit: CreationOptional<boolean>
  declare previewRowLimit: CreationOptional<number | null>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date | null>

  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
  // https://sequelize.org/api/v7/types/_sequelize_core.index.belongstocreateassociationmixin
  declare getDataset: BelongsToGetAssociationMixin<Dataset>
  declare setDataset: BelongsToSetAssociationMixin<Dataset, Dataset["id"]>
  declare createDataset: BelongsToCreateAssociationMixin<Dataset>

  declare getPreviewExcludedDatasetFields: HasManyGetAssociationsMixin<DatasetField>
  declare setPreviewExcludedDatasetFields: HasManySetAssociationsMixin<
    DatasetField,
    DatasetField["datasetId"]
  >
  declare hasPreviewExcludedDatasetField: HasManyHasAssociationMixin<
    DatasetField,
    DatasetField["datasetId"]
  >
  declare hasPreviewExcludedDatasetFields: HasManyHasAssociationsMixin<
    DatasetField,
    DatasetField["datasetId"]
  >
  declare addPreviewExcludedDatasetField: HasManyAddAssociationMixin<
    DatasetField,
    DatasetField["datasetId"]
  >
  declare addPreviewExcludedDatasetFields: HasManyAddAssociationsMixin<
    DatasetField,
    DatasetField["datasetId"]
  >
  declare removePreviewExcludedDatasetField: HasManyRemoveAssociationMixin<
    DatasetField,
    DatasetField["datasetId"]
  >
  declare removePreviewExcludedDatasetFields: HasManyRemoveAssociationsMixin<
    DatasetField,
    DatasetField["datasetId"]
  >
  declare countPreviewExcludedDatasetFields: HasManyCountAssociationsMixin
  declare createPreviewExcludedDatasetField: HasManyCreateAssociationMixin<DatasetField>

  declare dataset?: NonAttribute<Dataset>
  declare previewExcludedDatasetFields?: NonAttribute<DatasetField[]>

  declare static associations: {
    dataset: Association<VisualizationControl, Dataset>
    previewExcludedDatasetFields: Association<VisualizationControl, DatasetField>
  }

  static establishAssociations() {
    this.belongsTo(Dataset, { as: "dataset" })
    this.hasMany(DatasetField, {
      as: "previewExcludedDatasetFields",
      sourceKey: "datasetId",
      foreignKey: "datasetId",
      scope: {
        isExcludedFromPreview: true,
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
    hasPreview: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    hasFieldsExcludedFromPreview: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    hasPreviewRowLimit: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    previewRowLimit: {
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
