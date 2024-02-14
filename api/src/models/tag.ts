import {
  Association,
  CreationOptional,
  DataTypes,
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

import Tagging from "@/models/tagging"

export class Tag extends Model<InferAttributes<Tag>, InferCreationAttributes<Tag>> {
  declare id: CreationOptional<number>
  declare name: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date>

  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
  // https://sequelize.org/api/v7/types/_sequelize_core.index.belongstocreateassociationmixin
  declare getTaggings: HasManyGetAssociationsMixin<Tagging>
  declare setTaggings: HasManySetAssociationsMixin<Tagging, Tagging["tagId"]>
  declare hasTagging: HasManyHasAssociationMixin<Tagging, Tagging["tagId"]>
  declare hasTaggings: HasManyHasAssociationsMixin<Tagging, Tagging["tagId"]>
  declare addTagging: HasManyAddAssociationMixin<Tagging, Tagging["tagId"]>
  declare addTaggings: HasManyAddAssociationsMixin<Tagging, Tagging["tagId"]>
  declare removeTagging: HasManyRemoveAssociationMixin<Tagging, Tagging["tagId"]>
  declare removeTaggings: HasManyRemoveAssociationsMixin<Tagging, Tagging["tagId"]>
  declare countTaggings: HasManyCountAssociationsMixin
  declare createTagging: HasManyCreateAssociationMixin<Tagging>

  declare taggings?: NonAttribute<Tagging>

  declare static associations: {
    taggings: Association<Tag, Tagging>
  }

  static establishAssociations() {
    this.hasMany(Tagging, { as: "taggings" })
  }
}

Tag.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
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
        fields: ["name"],
        name: "unique_tags_name",
        where: {
          deleted_at: null,
        },
      },
    ]
  }
)

export default Tag
