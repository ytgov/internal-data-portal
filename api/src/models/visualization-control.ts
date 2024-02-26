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
  declare getDatasets: BelongsToGetAssociationMixin<Dataset>
  declare setDatasets: BelongsToSetAssociationMixin<Dataset, Dataset["id"]>
  declare createDataset: BelongsToCreateAssociationMixin<Dataset>

  declare dataset?: NonAttribute<Dataset>

  declare static associations: {
    dataset: Association<VisualizationControl, Dataset>
  }

  static establishAssociations() {
    this.belongsTo(Dataset, { as: "dataset" })
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
