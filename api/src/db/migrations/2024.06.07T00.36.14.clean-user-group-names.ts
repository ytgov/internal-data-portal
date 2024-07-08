import type { Migration } from "@/db/umzug";
import { QueryTypes } from "sequelize";

export const up: Migration = async ({ context: queryInterface }) => {
  const rows: { id: number, name: string }[] = await queryInterface.sequelize.query(
    'SELECT id, name FROM user_groups',
    {
      type: QueryTypes.SELECT,
    }
  );
  
  for (const row of rows) {
    const trimmedName = row.name.trim().replace(/\s+/g, " ");
    await queryInterface.sequelize.query(
      'UPDATE user_groups SET name = :trimmedName WHERE id = :userId',
      {
        replacements: { trimmedName, userId: row.id },
      }
    );
  }
};

export const down: Migration = async () => {
  // no-op
};