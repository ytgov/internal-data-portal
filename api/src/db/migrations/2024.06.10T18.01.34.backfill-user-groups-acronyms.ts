import { DataTypes, QueryTypes } from "sequelize"

import type { Migration } from "@/db/umzug"

export const up: Migration = async ({ context: queryInterface }) => {
  const batchSize = 1000
  let lastId = 0
  let userGroups: { id: number; name: string }[]

  do {
    userGroups = await queryInterface.sequelize.query(
      /* sql */ `
        SELECT TOP (:limit) id, name FROM user_groups
        WHERE id > :lastId
        ORDER BY id ASC
      `,
      {
        replacements: {
          limit: batchSize,
          lastId,
        },
        type: QueryTypes.SELECT,
      }
    )

    for (const userGroup of userGroups) {
      let acronym = userGroup.name
        .trim()
        .replace(/\s+/g, " ")
        .split(" ")
        .filter((word) => word[0] === word[0]?.toUpperCase())
        .map((word) => word[0])
        .join("")
      if (acronym === "") {
        acronym = `ERROR#${userGroup.id}`
      }

      await queryInterface.sequelize.query(
        /* sql */ `
          UPDATE user_groups
          SET acronym = :acronym
          WHERE id = :id
        `,
        {
          replacements: { acronym, id: userGroup.id },
          type: QueryTypes.UPDATE,
        }
      )
      lastId = userGroup.id
    }
  } while (userGroups.length === batchSize)

  await queryInterface.changeColumn("user_groups", "acronym", {
    type: DataTypes.STRING(10),
    allowNull: false,
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.changeColumn("user_groups", "acronym", {
    type: DataTypes.STRING(10),
    allowNull: true,
  })
}
