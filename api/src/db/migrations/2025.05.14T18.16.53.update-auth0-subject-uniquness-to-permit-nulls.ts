import { Op } from "sequelize"
import type { Migration } from "@/db/umzug"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeIndex("users", "unique_users_auth0_subject")

  await queryInterface.addIndex("users", {
    name: "unique_users_auth0_subject",
    unique: true,
    fields: ["auth0_subject"],
    where: {
      auth0_subject: {
        [Op.not]: null,
      },
      deleted_at: null,
    },
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeIndex("users", "unique_users_auth0_subject")

  await queryInterface.addIndex("users", {
    name: "unique_users_auth0_subject",
    unique: true,
    fields: ["auth0_subject"],
    where: {
      deleted_at: null,
    },
  })
}
