import {
  Model,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
  DataTypes,
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  BelongsToCreateAssociationMixin,
  NonAttribute,
  Association,
} from "sequelize"
import { isNil } from "lodash"

import sequelize from "@/db/db-client"

import User from "@/models/user"
import UserGroup, { UserGroupTypes } from "@/models/user-groups"
import Dataset from "./dataset"

export class DatasetStewardship extends Model<
  InferAttributes<DatasetStewardship>,
  InferCreationAttributes<DatasetStewardship>
> {
  declare id: CreationOptional<number>
  declare datasetId: ForeignKey<Dataset["id"]>
  declare ownerId: ForeignKey<User["id"]>
  declare supportId: ForeignKey<User["id"]>
  declare departmentId: ForeignKey<UserGroup["id"]>
  declare divisionId: ForeignKey<UserGroup["id"]> | null
  declare branchId: ForeignKey<UserGroup["id"]> | null
  declare unitId: ForeignKey<UserGroup["id"]> | null
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare deletedAt: CreationOptional<Date>

  // https://sequelize.org/docs/v6/other-topics/typescript/#usage
  // https://sequelize.org/docs/v6/core-concepts/assocs/#foohasmanybar
  // https://sequelize.org/api/v7/types/_sequelize_core.index.hasmanyaddassociationmixin
  declare getDataset: BelongsToGetAssociationMixin<Dataset>
  declare setDataset: BelongsToSetAssociationMixin<Dataset, Dataset["id"]>
  declare createDataset: BelongsToCreateAssociationMixin<Dataset>

  declare getOwner: BelongsToGetAssociationMixin<User>
  declare setOwner: BelongsToSetAssociationMixin<User, User["id"]>
  declare createOwner: BelongsToCreateAssociationMixin<User>

  declare getSupport: BelongsToGetAssociationMixin<User>
  declare setSupport: BelongsToSetAssociationMixin<User, User["id"]>
  declare createSupport: BelongsToCreateAssociationMixin<User>

  declare getDepartment: BelongsToGetAssociationMixin<UserGroup>
  declare setDepartment: BelongsToSetAssociationMixin<UserGroup, UserGroup["id"]>
  declare createDepartment: BelongsToCreateAssociationMixin<UserGroup>

  declare getDivision: BelongsToGetAssociationMixin<UserGroup>
  declare setDivision: BelongsToSetAssociationMixin<UserGroup, UserGroup["id"]>
  declare createDivision: BelongsToCreateAssociationMixin<UserGroup>

  declare getBranch: BelongsToGetAssociationMixin<UserGroup>
  declare setBranch: BelongsToSetAssociationMixin<UserGroup, UserGroup["id"]>
  declare createBranch: BelongsToCreateAssociationMixin<UserGroup>

  declare getUnit: BelongsToGetAssociationMixin<UserGroup>
  declare setUnit: BelongsToSetAssociationMixin<UserGroup, UserGroup["id"]>
  declare createUnit: BelongsToCreateAssociationMixin<UserGroup>

  declare dataset?: NonAttribute<Dataset>
  declare owner?: NonAttribute<User>
  declare support?: NonAttribute<User>
  declare department?: NonAttribute<UserGroup>
  declare division?: NonAttribute<UserGroup>
  declare branch?: NonAttribute<UserGroup>
  declare unit?: NonAttribute<UserGroup>

  declare static associations: {
    dataset: Association<DatasetStewardship, Dataset>
    owner: Association<DatasetStewardship, User>
    support: Association<DatasetStewardship, User>
    department: Association<DatasetStewardship, UserGroup>
    division: Association<DatasetStewardship, UserGroup>
    branch: Association<DatasetStewardship, UserGroup>
    unit: Association<DatasetStewardship, UserGroup>
  }

  static establishAssociations() {
    this.belongsTo(Dataset, { as: "dataset" })
    this.belongsTo(User, { as: "owner" })
    this.belongsTo(User, { as: "support" })
    this.belongsTo(UserGroup, { as: "department" })
    this.belongsTo(UserGroup, { as: "division" })
    this.belongsTo(UserGroup, { as: "branch" })
    this.belongsTo(UserGroup, { as: "unit" })
  }
}

DatasetStewardship.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    datasetId: {
      type: DataTypes.INTEGER,
      references: {
        model: "datasets",
        key: "id",
      },
      allowNull: false,
    },
    ownerId: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
      allowNull: false,
    },
    supportId: {
      type: DataTypes.INTEGER,
      references: {
        model: "users",
        key: "id",
      },
      allowNull: false,
    },
    departmentId: {
      type: DataTypes.INTEGER,
      references: {
        model: "user_groups",
        key: "id",
      },
      allowNull: false,
    },
    divisionId: {
      type: DataTypes.INTEGER,
      references: {
        model: "user_groups",
        key: "id",
      },
      allowNull: true,
    },
    branchId: {
      type: DataTypes.INTEGER,
      references: {
        model: "user_groups",
        key: "id",
      },
      allowNull: true,
    },
    unitId: {
      type: DataTypes.INTEGER,
      references: {
        model: "user_groups",
        key: "id",
      },
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
        name: "unique_dataset_stewardships_dataset_id",
        fields: ["datasetId"],
        where: {
          deletedAt: null,
        },
      },
    ],
    validate: {
      async validUserGroupings(this: DatasetStewardship) {
        if (isNil(this.departmentId)) {
          throw new Error("departmentId cannot be null")
        }

        const ids = [this.departmentId, this.divisionId, this.branchId, this.unitId]
          .map((id) => Number(id))
          .filter((id) => !isNaN(id) && id > 0)
        const userGroups = await UserGroup.findAll({
          where: {
            id: ids,
          },
        })
        const potentialDepartment = userGroups.find(
          (userGroup) =>
            userGroup.id === this.departmentId && userGroup.type === UserGroupTypes.DEPARTMENT
        )
        if (isNil(potentialDepartment)) {
          throw new Error("departmentId does not reference a valid department")
        }

        if (!isNil(this.division)) {
          const potentialDivision = userGroups.find(
            (userGroup) =>
              userGroup.id === this.divisionId && userGroup.type === UserGroupTypes.DIVISION
          )
          if (isNil(potentialDivision) || potentialDivision.parentId !== this.departmentId) {
            throw new Error("divisionId does not reference a valid division")
          }

          if (!isNil(this.branchId)) {
            const potentialBranch = userGroups.find(
              (userGroup) =>
                userGroup.id === this.branchId && userGroup.type === UserGroupTypes.BRANCH
            )
            if (isNil(potentialBranch) || potentialBranch.parentId !== this.divisionId) {
              throw new Error("branchId does not reference a valid branch")
            }

            if (!isNil(this.unitId)) {
              const potentialUnit = userGroups.find(
                (userGroup) =>
                  userGroup.id === this.unitId && userGroup.type === UserGroupTypes.UNIT
              )
              if (isNil(potentialUnit) || potentialUnit.parentId !== this.branchId) {
                throw new Error("unitId does not reference a valid unit")
              }
            }
          }
        }
      },
    },
  }
)

export default DatasetStewardship
