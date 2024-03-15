import { DataTypes } from "sequelize"

import type { Migration } from "@/db/umzug"

export const up: Migration = async ({ context: queryInterface }) => {
  await queryInterface.addColumn("users", "setup_from_email_first_login", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })

  await queryInterface.changeColumn("users", "auth0_subject", {
    type: DataTypes.STRING(100),
    allowNull: true,
  })
}

export const down: Migration = async ({ context: queryInterface }) => {
  await queryInterface.removeColumn("users", "setup_from_email_first_login")

  // This would require manual intervention to fix the auth0_subject values afterwards
  // It might be better to just delete the appropriate rows?
  await queryInterface.sequelize.query(/* sql */ `
    UPDATE users
    SET auth0_subject = CONCAT('IDP:', CAST(id AS VARCHAR), ':SETUP_FROM_EMAIL_FIRST_LOGIN')
    WHERE auth0_subject IS NULL;
  `)

  await queryInterface.changeColumn("users", "auth0_subject", {
    type: DataTypes.STRING(100),
    allowNull: false,
  })
}
