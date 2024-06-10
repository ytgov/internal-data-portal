import { DataTypes } from "sequelize"

import type { Migration } from "@/db/umzug"
import { UserGroup } from "@/models"
import acronymize from "@/utils/acronymize"

export const up: Migration = async ({ context: queryInterface }) => {
  await UserGroup.findEach(async (userGroup) => {
    const acronym = acronymize(userGroup.name)
    await userGroup.update({
      acronym,
    })
  })

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
