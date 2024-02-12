import {
  Association,
  BelongsToCreateAssociationMixin,
  BelongsToGetAssociationMixin,
  BelongsToGetAssociationMixinOptions,
  BelongsToSetAssociationMixin,
  BelongsToSetAssociationMixinOptions,
  CreationOptional,
  DataTypes,
  ForeignKey,
  InferAttributes,
  InferCreationAttributes,
  Model,
  NonAttribute,
} from "sequelize"
import { isEmpty, isNil } from "lodash"

import sequelize from "@/db/db-client"

import Tag from "@/models/tag"
import Dataset from "@/models/dataset"

export type Taggable = Dataset // | OtherModel
export enum TaggableTypes {
  DATASET = "Dataset", //
  // OTHER_MODEL = 'OtherModel'
}

export class Tagging extends Model<InferAttributes<Tagging>, InferCreationAttributes<Tagging>> {
  declare id: CreationOptional<number>
  declare tagId: ForeignKey<Tag["id"]>
  declare taggableId: number
  declare taggableType: TaggableTypes
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date>

  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
  // https://sequelize.org/api/v7/types/_sequelize_core.index.belongstocreateassociationmixin
  declare getTag: BelongsToGetAssociationMixin<Tag>
  declare setTag: BelongsToSetAssociationMixin<Tag, Tag["id"]>
  declare createTag: BelongsToCreateAssociationMixin<Tag>

  // specific taggable type implementations
  private declare getDataset: BelongsToGetAssociationMixin<Dataset>
  private declare setDataset: BelongsToSetAssociationMixin<Dataset, Dataset["id"]>
  private declare createDataset: BelongsToCreateAssociationMixin<Dataset>

  declare tag?: NonAttribute<Tag>
  declare taggable?: NonAttribute<Taggable>

  // specific taggable type implementations
  declare dataset?: NonAttribute<Dataset>

  declare static associations: {
    tag: Association<Tagging, Tag>
    taggable: Association<Tagging, Taggable>

    // specific taggable type implementations
    dataset: Association<Tagging, Dataset>
  }

  static establishAssociations() {
    this.belongsTo(Tag, {
      foreignKey: "tagId",
      as: "tag",
    })
    // specific taggable type implementations
    this.belongsTo(Dataset, {
      foreignKey: "taggableId",
      constraints: false,
    })
  }

  // declare getTaggable: BelongsToGetAssociationMixin<Taggable>
  // getTaggable(options?: BelongsToGetAssociationMixinOptions<Dataset>): Promise<Dataset | null>
  getTaggable(options?: BelongsToGetAssociationMixinOptions): Promise<Taggable | null> {
    if (!this.taggableType) return Promise.resolve(null)

    if (this.taggableType === TaggableTypes.DATASET) {
      return this.getDataset(options)
    } else {
      return Promise.resolve(null)
    }
  }

  // declare setTaggable: BelongsToSetAssociationMixin<Taggable, Taggable["id"]>
  // setTaggable(newAssociation?: Dataset | Dataset["id"], options?: BelongsToSetAssociationMixinOptions): Promise<void>
  setTaggable(
    newAssociation?: Taggable | Taggable["id"],
    options?: BelongsToSetAssociationMixinOptions
  ): Promise<void> {
    if (!this.taggableType) return Promise.reject("No taggable type set")

    if (this.taggableType === TaggableTypes.DATASET) {
      return this.setDataset(newAssociation, options)
    } else {
      return Promise.reject("Invalid taggable type")
    }
  }

  // declare createTaggable: BelongsToCreateAssociationMixin<Taggable>
  // createTaggable(values?: InferCreationAttributes<Dataset>): Promise<Dataset>
  createTaggable(values?: InferCreationAttributes<Taggable>): Promise<Taggable> {
    if (!this.taggableType) return Promise.reject("No taggable type set")

    if (this.taggableType === TaggableTypes.DATASET) {
      return this.createDataset(values)
    } else {
      return Promise.reject("Invalid taggable type")
    }
  }
}

Tagging.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    tagId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "tags",
        key: "id",
      },
    },
    taggableId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    taggableType: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: [Object.values(TaggableTypes)],
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
        fields: ["tag_id", "taggable_type", "taggable_id"],
        name: "unique_taggings_on_tag_id_and_taggable_type_and_taggable_id",
        where: {
          deleted_at: null,
        },
      },
      {
        fields: ["taggable_type", "taggable_id"],
        name: "index_taggings_on_taggable_type_and_taggable_id",
      },
    ],
    hooks: {
      // See https://sequelize.org/docs/v6/advanced-association-concepts/polymorphic-associations/#configuring-a-one-to-many-polymorphic-association
      // afterFind(instancesOrInstance: readonly M[] | M | null, options: FindOptions<TAttributes>): HookReturn;
      afterFind: (findResult: Tagging[] | Tagging | null) => {
        if (isNil(findResult) || isEmpty(findResult)) return Promise.resolve()

        let findResultArray: Tagging[]
        if (!Array.isArray(findResult)) {
          findResultArray = [findResult]
        } else {
          findResultArray = findResult
        }

        for (const instance of findResultArray) {
          if (instance.taggableType === TaggableTypes.DATASET && instance.dataset !== undefined) {
            instance.taggable = instance.dataset
          }

          // To prevent mistakes:
          delete instance.dataset
          // Sequelize 7 might not raise an error here, or it might make this code unnecessary.
          // @ts-expect-error - See documentation https://sequelize.org/docs/v6/advanced-association-concepts/polymorphic-associations/#configuring-a-one-to-many-polymorphic-association
          delete instance.dataValues.dataset
        }
      },
    },
  }
)

export default Tagging
