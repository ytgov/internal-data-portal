import type { Migration } from "@/db/umzug"
import { UserGroup } from "@/models"

export const up: Migration = async ({ context: queryInterface }) => {
  // https://stackoverflow.com/questions/6940646/mysql-how-to-remove-double-or-more-spaces-from-a-string
  await queryInterface.sequelize.query(`UPDATE user_groups SET name = REPLACE(REPLACE(REPLACE(TRIM(name), ' ', '<>'), '><', ''), '<>', ' ');`);
}

export const down: Migration = async () => {
  // no-op
}
