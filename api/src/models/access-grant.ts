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

import AccessRequest from "@/models/access-request"
import Dataset from "@/models/dataset"
import User from "@/models/user"

export enum GrantLevels {
  GOVERNMENT_WIDE = "government_wide",
  DEPARTMENT = "department",
  DIVISION = "division",
  BRANCH = "branch",
  UNIT = "unit",
}

export enum AccessTypes {
  // This is a special access type that is not stored in the database
  // "no access" is determined by the absence of any access grants
  // It's only here for repeatable use in other places
  NO_ACCESS = "no_access",
  // Request - I want to control access to my data and need to know how they will use my data,
  // I need to inform them of any changes that are made.
  SCREENED_ACCESS = "screened_access",
  // Subscribe - I am happy to share my data but I need to know who is using it as there might be changes
  SELF_SERVE_ACCESS = "self_serve_access",
  // Open - I don't care who uses my data I am not likely to change it.
  OPEN_ACCESS = "open_access",
}

export const AccessTypeOrdering = Object.values(AccessTypes)

export function orderOfAccessType(type: AccessTypes): number {
  return AccessTypeOrdering.indexOf(type)
}

export class AccessGrant extends Model<
  InferAttributes<AccessGrant>,
  InferCreationAttributes<AccessGrant>
> {
  static readonly GrantLevels = GrantLevels
  static readonly AccessTypes = AccessTypes

  declare id: CreationOptional<number>
  declare datasetId: ForeignKey<Dataset["id"]>
  declare creatorId: ForeignKey<User["id"]>
  declare supportId: ForeignKey<User["id"]> | null
  declare grantLevel: GrantLevels
  declare accessType: AccessTypes
  declare isProjectDescriptionRequired: CreationOptional<boolean>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date | null>

  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
  // https://sequelize.org/api/v7/types/_sequelize_core.index.belongstocreateassociationmixin
  declare getDataset: BelongsToGetAssociationMixin<Dataset>
  declare setDataset: BelongsToSetAssociationMixin<Dataset, Dataset["id"]>
  declare createDataset: BelongsToCreateAssociationMixin<Dataset>

  declare getCreator: BelongsToGetAssociationMixin<User>
  declare setCreator: BelongsToSetAssociationMixin<User, User["id"]>
  declare createCreator: BelongsToCreateAssociationMixin<User>

  declare getSupport: BelongsToGetAssociationMixin<User>
  declare setSupport: BelongsToSetAssociationMixin<User, User["id"]>
  declare createSupport: BelongsToCreateAssociationMixin<User>

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

  declare dataset?: NonAttribute<Dataset>
  declare creator?: NonAttribute<User>
  declare support?: NonAttribute<User>
  declare accessRequests?: NonAttribute<AccessRequest[]>

  declare static associations: {
    dataset: Association<AccessGrant, Dataset>
    creator: Association<AccessGrant, User>
    support: Association<AccessGrant, User>
    accessRequests: Association<Dataset, AccessRequest>
  }

  static establishAssociations() {
    this.belongsTo(Dataset, { as: "dataset" })
    this.belongsTo(User, {
      foreignKey: "creatorId",
      as: "creator",
    })
    this.belongsTo(User, {
      foreignKey: "supportId",
      as: "support",
    })
    this.hasMany(AccessRequest, {
      foreignKey: "datasetId",
      as: "accessRequests",
    })
  }
}

AccessGrant.init(
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
        model: "datasets",
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
    supportId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    grantLevel: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: [Object.values(GrantLevels)],
      },
    },
    accessType: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isIn: [Object.values(AccessTypes)],
      },
    },
    isProjectDescriptionRequired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    validate: {
      async grantLevelAndAccessTypeAreUnique(this: AccessGrant) {
        const existingAccessGrant = await AccessGrant.findOne({
          where: {
            datasetId: this.datasetId,
            grantLevel: this.grantLevel,
            accessType: this.accessType,
          },
        })

        if (existingAccessGrant && existingAccessGrant.id !== this.id) {
          throw new Error(
            `An access grant with grant level ${this.grantLevel} and access type ${this.accessType} already exists for this dataset`
          )
        }
      },
    },
    indexes: [
      {
        unique: true,
        fields: ["dataset_id", "grant_level", "access_type"],
        name: "unique_access_grants_on_dataset_id_and_grant_level_and_access_type",
        where: {
          deletedAt: null,
        },
      },
    ],
  }
)

export default AccessGrant
