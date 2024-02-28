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

import DatasetField from "@/models/dataset-field"
import VisualizationControl from "@/models/visualization-control"

// TODO: consider simply adding a DatasetField#isExcludedFromSearch boolean field instead of this model
export class SearchFieldExclusion extends Model<
  InferAttributes<SearchFieldExclusion>,
  InferCreationAttributes<SearchFieldExclusion>
> {
  declare id: CreationOptional<number>
  declare visualizationControlId: ForeignKey<VisualizationControl["id"]>
  declare datasetFieldId: ForeignKey<DatasetField["id"]>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date>

  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
  // https://sequelize.org/api/v7/types/_sequelize_core.index.belongstocreateassociationmixin
  declare getDatasetField: BelongsToGetAssociationMixin<DatasetField>
  declare setDatasetField: BelongsToSetAssociationMixin<DatasetField, DatasetField["id"]>
  declare createDatasetField: BelongsToCreateAssociationMixin<DatasetField>

  declare getVisualizationControl: BelongsToGetAssociationMixin<VisualizationControl>
  declare setVisualizationControl: BelongsToSetAssociationMixin<
    VisualizationControl,
    VisualizationControl["id"]
  >
  declare createVisualizationControl: BelongsToCreateAssociationMixin<VisualizationControl>

  declare datasetField?: NonAttribute<DatasetField>
  declare visualizationControl?: NonAttribute<VisualizationControl>

  declare static associations: {
    datasetField: Association<SearchFieldExclusion, DatasetField>
    visualizationControl: Association<SearchFieldExclusion, VisualizationControl>
  }

  static establishAssociations() {
    this.belongsTo(DatasetField, { as: "datasetField" })
    this.belongsTo(VisualizationControl, { as: "visualizationControl" })
  }
}

SearchFieldExclusion.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    visualizationControlId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: VisualizationControl,
        key: "id",
      },
    },
    datasetFieldId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: DatasetField,
        key: "id",
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
        unique: true,
        fields: ["visualization_control_id", "dataset_field_id"],
        name: "unique_search_field_exclusions_on_visualization_control_id_and_dataset_field_id",
        where: {
          deleted_at: null,
        },
      },
    ],
  }
)

export default SearchFieldExclusion
