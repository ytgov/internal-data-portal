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
import User from "@/models/user"
import AccessGrant from "@/models/access-grant"

export class AccessRequest extends Model<
  InferAttributes<AccessRequest>,
  InferCreationAttributes<AccessRequest>
> {
  declare id: CreationOptional<number>
  declare datasetId: ForeignKey<Dataset["id"]>
  declare accessGrantId: ForeignKey<AccessGrant["id"]>
  declare requestorId: ForeignKey<User["id"]>
  declare denierId: ForeignKey<User["id"]> | null
  declare approverId: ForeignKey<User["id"]> | null
  declare revokerId: ForeignKey<User["id"]> | null
  declare accessCode: string
  declare projectName: CreationOptional<string | null>
  declare projectDescription: CreationOptional<string | null>
  declare approvedAt: CreationOptional<Date | null>
  declare deniedAt: CreationOptional<Date | null>
  declare denialReason: CreationOptional<string | null>
  declare revokedAt: CreationOptional<Date | null>
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date | null>

  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#special-methodsmixins-added-to-instances
  // https://sequelize.org/api/v7/types/_sequelize_core.index.belongstocreateassociationmixin
  declare getAccessGrant: BelongsToGetAssociationMixin<AccessGrant>
  declare setAccessGrant: BelongsToSetAssociationMixin<AccessGrant, AccessGrant["id"]>
  declare createAccessGrant: BelongsToCreateAssociationMixin<AccessGrant>

  declare getDataset: BelongsToGetAssociationMixin<Dataset>
  declare setDataset: BelongsToSetAssociationMixin<Dataset, Dataset["id"]>
  declare createDataset: BelongsToCreateAssociationMixin<Dataset>

  declare getRequestor: BelongsToGetAssociationMixin<User>
  declare setRequestor: BelongsToSetAssociationMixin<User, User["id"]>
  declare createRequestor: BelongsToCreateAssociationMixin<User>

  declare getDenier: BelongsToGetAssociationMixin<User>
  declare setDenier: BelongsToSetAssociationMixin<User, User["id"]>
  declare createDenier: BelongsToCreateAssociationMixin<User>

  declare getApprover: BelongsToGetAssociationMixin<User>
  declare setApprover: BelongsToSetAssociationMixin<User, User["id"]>
  declare createApprover: BelongsToCreateAssociationMixin<User>

  declare getRevoker: BelongsToGetAssociationMixin<User>
  declare setRevoker: BelongsToSetAssociationMixin<User, User["id"]>
  declare createRevoker: BelongsToCreateAssociationMixin<User>

  declare accessGrant?: NonAttribute<AccessGrant>
  declare requestor?: NonAttribute<User>
  declare dataset?: NonAttribute<Dataset>
  declare denier?: NonAttribute<User>
  declare approver?: NonAttribute<User>
  declare revoker?: NonAttribute<User>

  declare static associations: {
    accessGrant: Association<AccessRequest, AccessGrant>
    dataset: Association<AccessRequest, Dataset>
    requestor: Association<AccessRequest, User>
    denier: Association<AccessRequest, User>
    approver: Association<AccessRequest, User>
    revoker: Association<AccessRequest, User>
  }

  static establishAssociations() {
    this.belongsTo(Dataset, {
      foreignKey: "datasetId",
      as: "dataset",
    })
    this.belongsTo(AccessGrant, {
      foreignKey: "accessGrantId",
      as: "accessGrant",
    })
    this.belongsTo(User, {
      foreignKey: "requestorId",
      as: "requestor",
    })
    this.belongsTo(User, {
      foreignKey: "denierId",
      as: "denier",
    })
    this.belongsTo(User, {
      foreignKey: "approverId",
      as: "approver",
    })
    this.belongsTo(User, {
      foreignKey: "revokerId",
      as: "revoker",
    })
  }

  isApproved(): NonAttribute<boolean> {
    return this.revokedAt === null && this.approvedAt !== null
  }

  isRevoked(): NonAttribute<boolean> {
    return this.revokedAt !== null
  }

  isDenied(): NonAttribute<boolean> {
    return this.deniedAt !== null
  }
}

AccessRequest.init(
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
    accessGrantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    requestorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    denierId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    approverId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    revokerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "users",
        key: "id",
      },
    },
    accessCode: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    projectName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    projectDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deniedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    denialReason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    revokedAt: {
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
        fields: ["dataset_id", "requestor_id"],
        name: "unique_access_requests_on_dataset_id_and_requestor_id",
        where: {
          deletedAt: null,
        },
      },
      {
        unique: true,
        fields: ["access_grant_id", "requestor_id"],
        name: "unique_access_requests_on_access_grant_id_and_requestor_id",
        where: {
          deletedAt: null,
        },
      },
    ],
    validate: {
      async accessGrantRefersToSameDataset() {
        if (typeof this.datasetId !== "number" || typeof this.accessGrantId !== "number") {
          throw new Error("Dataset and AccessGrant must be numbers.")
        }

        const count = await AccessGrant.count({
          where: { id: this.accessGrantId, datasetId: this.datasetId },
        })
        if (count !== 1) {
          throw new Error("AcccessGrant must refer to the same dataset as the AccessRequest.")
        }
      },
    },
    scopes: {
      withDatasetOwnerId(ownerId: number) {
        return {
          include: [
            {
              association: "dataset",
              where: {
                ownerId,
              },
            },
          ],
        }
      },
    },
  }
)

export default AccessRequest
