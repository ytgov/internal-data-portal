import { Sequelize, Options } from "sequelize"
import { createNamespace } from "cls-hooked"

import { DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT, NODE_ENV } from "@/config"

export const transactionManager = createNamespace("transaction-manager")
Sequelize.useCLS(transactionManager)

if (DB_NAME === undefined) throw new Error("database name is unset.")
if (DB_USER === undefined) throw new Error("database username is unset.")
if (DB_PASS === undefined) throw new Error("database password is unset.")
if (DB_HOST === undefined) throw new Error("database host is unset.")
if (DB_PORT === undefined) throw new Error("database port is unset.")

export const SEQUELIZE_CONFIG: Options = {
  username: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  dialect: "mssql",
  host: DB_HOST,
  port: DB_PORT,
  schema: "dbo",
  logging: NODE_ENV === "development" ? console.log : false,
  define: {
    underscored: true,
    timestamps: true, // This is actually the default, but making it explicit for clarity.
    paranoid: true, // adds deleted_at column
    whereMergeStrategy: "and", // where fields will be merged using the and operator (instead of overwriting each other)
  },
}

export const db = new Sequelize(SEQUELIZE_CONFIG)

export default db
