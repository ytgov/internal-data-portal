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
  NonAttribute,
} from "sequelize"

import sequelize from "@/db/db-client"

import AccessGrant from "@/models/access-grant"
import AccessRequest from "@/models/access-request"
import StewardshipEvolution from "@/models/stewardship-evolution"
import Tag from "@/models/tag"
import Tagging, { TaggableTypes } from "@/models/tagging"
import User from "@/models/user"

import BaseModel from "@/models/base-model"

export enum DatasetErrorTypes {
  OK = "ok",
  ERRORED = "errored",
}

export class Dataset extends BaseModel<InferAttributes<Dataset>, InferCreationAttributes<Dataset>> {
  static readonly ErrorTypes = DatasetErrorTypes

  declare id: CreationOptional<number>
  declare ownerId: ForeignKey<User["id"]>
  declare creatorId: ForeignKey<User["id"]>
  declare slug: string
  declare name: string
  declare description: string
  declare subscriptionUrl: CreationOptional<string | null>
  declare subscriptionAccessCode: CreationOptional<string | null>
  declare isSubscribable: CreationOptional<boolean>
  declare isSpatialData: CreationOptional<boolean>
  declare isLiveData: CreationOptional<boolean>
  declare termsOfUse: CreationOptional<string | null>
  declare credits: CreationOptional<string | null>
  declare ownerNotes: CreationOptional<string | null>
  declare status: CreationOptional<DatasetErrorTypes>
  declare errorCode: CreationOptional<string | null>
  declare errorDetails: CreationOptional<string | null>
  declare publishedAt: CreationOptional<Date | null>
  declare deactivatedAt: CreationOptional<Date | null>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date>

  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
  // https://sequelize.org/api/v7/types/_sequelize_core.index.belongstocreateassociationmixin
  declare getOwner: BelongsToGetAssociationMixin<User>
  declare setOwner: BelongsToSetAssociationMixin<User, User["id"]>
  declare createOwner: BelongsToCreateAssociationMixin<User>

  declare getCreator: BelongsToGetAssociationMixin<User>
  declare setCreator: BelongsToSetAssociationMixin<User, User["id"]>
  declare createCreator: BelongsToCreateAssociationMixin<User>

  declare getAccessGrants: HasManyGetAssociationsMixin<AccessGrant>
  declare setAccessGrants: HasManySetAssociationsMixin<AccessGrant, AccessGrant["datasetId"]>
  declare hasAccessGrant: HasManyHasAssociationMixin<AccessGrant, AccessGrant["datasetId"]>
  declare hasAccessGrants: HasManyHasAssociationsMixin<AccessGrant, AccessGrant["datasetId"]>
  declare addAccessGrant: HasManyAddAssociationMixin<AccessGrant, AccessGrant["datasetId"]>
  declare addAccessGrants: HasManyAddAssociationsMixin<AccessGrant, AccessGrant["datasetId"]>
  declare removeAccessGrant: HasManyRemoveAssociationMixin<AccessGrant, AccessGrant["datasetId"]>
  declare removeAccessGrants: HasManyRemoveAssociationsMixin<AccessGrant, AccessGrant["datasetId"]>
  declare countAccessGrants: HasManyCountAssociationsMixin
  declare createAccessGrant: HasManyCreateAssociationMixin<AccessGrant>

  declare getAccessRequests: HasManyGetAssociationsMixin<AccessRequest>
  declare setAccessRequests: HasManySetAssociationsMixin<AccessRequest, AccessRequest["datasetId"]>
  declare hasAccessRequest: HasManyHasAssociationMixin<AccessRequest, AccessRequest["datasetId"]>
  declare hasAccessRequests: HasManyHasAssociationsMixin<AccessRequest, AccessRequest["datasetId"]>
  declare addAccessRequest: HasManyAddAssociationMixin<AccessRequest, AccessRequest["datasetId"]>
  declare addAccessRequests: HasManyAddAssociationsMixin<AccessRequest, AccessRequest["datasetId"]>
  declare removeAccessRequest: HasManyRemoveAssociationMixin<
    AccessRequest,
    AccessRequest["datasetId"]
  >
  declare removeAccessRequests: HasManyRemoveAssociationsMixin<
    AccessRequest,
    AccessRequest["datasetId"]
  >
  declare countAccessRequests: HasManyCountAssociationsMixin
  declare createAccessRequest: HasManyCreateAssociationMixin<AccessRequest>

  declare getStewardshipEvolutions: HasManyGetAssociationsMixin<StewardshipEvolution>
  declare setStewardshipEvolutions: HasManySetAssociationsMixin<
    StewardshipEvolution,
    StewardshipEvolution["datasetId"]
  >
  declare hasStewardshipEvolution: HasManyHasAssociationMixin<
    StewardshipEvolution,
    StewardshipEvolution["datasetId"]
  >
  declare hasStewardshipEvolutions: HasManyHasAssociationsMixin<
    StewardshipEvolution,
    StewardshipEvolution["datasetId"]
  >
  declare addStewardshipEvolution: HasManyAddAssociationMixin<
    StewardshipEvolution,
    StewardshipEvolution["datasetId"]
  >
  declare addStewardshipEvolutions: HasManyAddAssociationsMixin<
    StewardshipEvolution,
    StewardshipEvolution["datasetId"]
  >
  declare removeStewardshipEvolution: HasManyRemoveAssociationMixin<
    StewardshipEvolution,
    StewardshipEvolution["datasetId"]
  >
  declare removeStewardshipEvolutions: HasManyRemoveAssociationsMixin<
    StewardshipEvolution,
    StewardshipEvolution["datasetId"]
  >
  declare countStewardshipEvolutions: HasManyCountAssociationsMixin
  declare createStewardshipEvolution: HasManyCreateAssociationMixin<StewardshipEvolution>

  declare getTaggings: HasManyGetAssociationsMixin<Tagging>
  declare setTaggings: HasManySetAssociationsMixin<Tagging, Tagging["taggableId"]>
  declare hasTagging: HasManyHasAssociationMixin<Tagging, Tagging["taggableId"]>
  declare hasTaggings: HasManyHasAssociationsMixin<Tagging, Tagging["taggableId"]>
  declare addTagging: HasManyAddAssociationMixin<Tagging, Tagging["taggableId"]>
  declare addTaggings: HasManyAddAssociationsMixin<Tagging, Tagging["taggableId"]>
  declare removeTagging: HasManyRemoveAssociationMixin<Tagging, Tagging["taggableId"]>
  declare removeTaggings: HasManyRemoveAssociationsMixin<Tagging, Tagging["taggableId"]>
  declare countTaggings: HasManyCountAssociationsMixin
  declare createTagging: HasManyCreateAssociationMixin<Tagging>

  declare getTags: HasManyGetAssociationsMixin<Tag>
  declare setTags: HasManySetAssociationsMixin<Tag, Tag["id"]>
  declare hasTag: HasManyHasAssociationMixin<Tag, Tag["id"]>
  declare hasTags: HasManyHasAssociationsMixin<Tag, Tag["id"]>
  declare addTag: HasManyAddAssociationMixin<Tag, Tag["id"]>
  declare addTags: HasManyAddAssociationsMixin<Tag, Tag["id"]>
  declare removeTag: HasManyRemoveAssociationMixin<Tag, Tag["id"]>
  declare removeTags: HasManyRemoveAssociationsMixin<Tag, Tag["id"]>
  declare countTags: HasManyCountAssociationsMixin
  declare createTag: HasManyCreateAssociationMixin<Tag>

  declare owner?: NonAttribute<User>
  declare creator?: NonAttribute<User>
  declare accessGrants?: NonAttribute<AccessGrant[]>
  declare accessRequests?: NonAttribute<AccessRequest[]>
  declare stewardshipEvolutions?: NonAttribute<StewardshipEvolution[]>
  declare taggings?: NonAttribute<Tagging[]>
  declare tags?: NonAttribute<Tag[]>

  declare static associations: {
    owner: Association<Dataset, User>
    creator: Association<Dataset, User>
    accessGrants: Association<Dataset, AccessGrant>
    accessRequests: Association<Dataset, AccessRequest>
    stewardshipEvolutions: Association<Dataset, StewardshipEvolution>
    taggings: Association<Dataset, Tagging>
    tags: Association<Dataset, Tag>
  }

  static establishAssociations() {
    this.belongsTo(User, {
      foreignKey: "ownerId",
      as: "owner",
    })
    this.belongsTo(User, {
      foreignKey: "creatorId",
      as: "creator",
    })
    this.hasMany(AccessRequest, {
      foreignKey: "datasetId",
      as: "accessRequests",
    })
    this.hasMany(StewardshipEvolution, {
      sourceKey: "id",
      foreignKey: "datasetId",
      as: "stewardshipEvolutions",
    })
    this.hasMany(Tagging, {
      foreignKey: "taggableId",
      constraints: false,
      scope: {
        taggableType: TaggableTypes.DATASET,
      },
      as: "taggings",
    })
    this.belongsToMany(Tag, {
      foreignKey: "taggableId",
      constraints: false,
      through: {
        model: Tagging,
        scope: {
          taggableType: TaggableTypes.DATASET,
        },
      },
      as: "tags",
    })
    this.hasMany(AccessGrant, {
      foreignKey: "datasetId",
      as: "accessGrants",
    })
  }
}

Dataset.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    slug: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    subscriptionUrl: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    subscriptionAccessCode: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isSubscribable: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isSpatialData: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    isLiveData: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    termsOfUse: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    credits: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ownerNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: DatasetErrorTypes.OK,
      validate: {
        isIn: [Object.values(DatasetErrorTypes)],
      },
    },
    errorCode: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    errorDetails: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    publishedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deactivatedAt: {
      type: DataTypes.DATE,
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
        fields: ["slug"],
        name: "unique_datasets_slug",
        where: {
          deleted_at: null,
        },
      },
    ],
  }
)

export default Dataset
