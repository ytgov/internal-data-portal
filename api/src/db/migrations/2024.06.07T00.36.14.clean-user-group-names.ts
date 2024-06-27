import type { Migration } from "@/db/umzug"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    const [rows]: any[] = await queryInterface.sequelize.query('SELECT name from user_groups', { transaction });
    for (const row of rows) {
      const trimmedName = row.name.trim().replace(/\s+/g, " ")
      await queryInterface.sequelize.query('UPDATE user_groups SET name = ? WHERE id = ?', {
        replacements: [trimmedName, row.id],
        transaction
      });
    }
  });
}

export const down: Migration = async () => {
  // no-op
}
