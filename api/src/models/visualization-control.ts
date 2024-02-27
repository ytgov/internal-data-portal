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
import SearchFieldExclusion from "@/models/search-field-exclusion"

export class VisualizationControl extends Model<
  InferAttributes<VisualizationControl>,
  InferCreationAttributes<VisualizationControl>
> {
  declare id: CreationOptional<number>
  declare datasetId: ForeignKey<Dataset["id"]>
  declare isDowloadableAsCsv: CreationOptional<boolean>
  declare hasSearchRestrictions: CreationOptional<boolean>
  declare hasSearchFieldRestrictions: CreationOptional<boolean>
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

  declare getSearchFieldExclusions: HasManyGetAssociationsMixin<SearchFieldExclusion>
  declare setSearchFieldExclusions: HasManySetAssociationsMixin<
    SearchFieldExclusion,
    SearchFieldExclusion["visualizationControlId"]
  >
  declare hasSearchFieldExclusion: HasManyHasAssociationMixin<
    SearchFieldExclusion,
    SearchFieldExclusion["visualizationControlId"]
  >
  declare hasSearchFieldExclusions: HasManyHasAssociationsMixin<
    SearchFieldExclusion,
    SearchFieldExclusion["visualizationControlId"]
  >
  declare addSearchFieldExclusion: HasManyAddAssociationMixin<
    SearchFieldExclusion,
    SearchFieldExclusion["visualizationControlId"]
  >
  declare addSearchFieldExclusions: HasManyAddAssociationsMixin<
    SearchFieldExclusion,
    SearchFieldExclusion["visualizationControlId"]
  >
  declare removeSearchFieldExclusion: HasManyRemoveAssociationMixin<
    SearchFieldExclusion,
    SearchFieldExclusion["visualizationControlId"]
  >
  declare removeSearchFieldExclusions: HasManyRemoveAssociationsMixin<
    SearchFieldExclusion,
    SearchFieldExclusion["visualizationControlId"]
  >
  declare countSearchFieldExclusions: HasManyCountAssociationsMixin
  declare createSearchFieldExclusion: HasManyCreateAssociationMixin<SearchFieldExclusion>

  declare dataset?: NonAttribute<Dataset>
  declare searchFieldExclusions?: NonAttribute<SearchFieldExclusion[]>

  declare static associations: {
    dataset: Association<VisualizationControl, Dataset>
    searchFieldExclusions: Association<VisualizationControl, SearchFieldExclusion>
  }

  static establishAssociations() {
    this.belongsTo(Dataset, { as: "dataset" })
    this.hasMany(SearchFieldExclusion, { as: "searchFieldExclusions" })
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
    isDowloadableAsCsv: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    hasSearchRestrictions: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    hasSearchFieldRestrictions: {
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
