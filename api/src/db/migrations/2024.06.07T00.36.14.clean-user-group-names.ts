import type { Migration } from "@/db/umzug"

export const up: Migration = async ({ context: queryInterface }) => {
  const [rows]: any[] = await queryInterface.sequelize.query('SELECT name from user_groups');
  for (const row of rows) {
    const trimmedName = row.name.trim().replace(/\s+/g, " ")
    await queryInterface.sequelize.query('UPDATE user_groups SET name = ? WHERE id = ?', {
      replacements: [trimmedName, row.id]
    });
  }
}

export const down: Migration = async () => {
  // no-op
}
