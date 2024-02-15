import { DataTypes, Op } from "sequelize"

import type { Migration } from "@/db/umzug"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("access_grants", "support_id", {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "users",
      key: "id",
    },
    onUpdate: "CASCADE",
  })

  await queryInterface.sequelize.query(`
    UPDATE access_grants
    SET support_id = requestor_id
  `)

  await queryInterface.removeIndex(
    "access_grants",
    "unique_access_grants_on_dataset_id_and_requestor_id"
  )
  await queryInterface.removeColumn("access_grants", "requestor_id")
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("access_grants", "requestor_id", {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "users",
      key: "id",
    },
  })

  await queryInterface.addIndex("access_grants", ["dataset_id", "requestor_id"], {
    unique: true,
    name: "unique_access_grants_on_dataset_id_and_requestor_id",
    where: {
      requestor_id: { [Op.ne]: null },
      deleted_at: null,
    },
  })

  await queryInterface.sequelize.query(`
    UPDATE access_grants
    SET requestor_id = support_id
  `)

  await queryInterface.removeColumn("access_grants", "support_id")
}
