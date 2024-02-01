/*
See https://jestjs.io/docs/configuration#setupfilesafterenv-array

Run some code to configure or set up the testing framework before each test
file in the suite is executed. Since setupFiles executes before the test framework is
installed in the environment, this script file presents you the opportunity of running
some code immediately after the test framework has been installed in the environment
but before the test code itself.

In other words, setupFilesAfterEnv modules are meant for code which is repeating in
each test file. Having the test framework installed makes Jest globals,
jest object and expect accessible in the modules. For example, you can add extra matchers
from jest-extended library or call setup and teardown hooks.
*/

import { QueryTypes } from "sequelize"

import db from "@/models"

async function getTableNames() {
  const query = `
    SELECT table_name as "tableName"
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
    AND table_name != 'SequelizeMeta'
    AND table_name != 'knex_migrations'
    AND table_name != 'knex_migrations_lock';
  `

  try {
    const result = await db.query<{ tableName: string }>(query, { type: QueryTypes.SELECT })
    const tableNames = result.map((row) => row.tableName)
    return tableNames
  } catch (error) {
    console.error("Error fetching table names:", error)
    throw error
  }
}

async function cleanDatabase() {
  const tableNames = await getTableNames()
  const quotedTableNames = tableNames.map((name) => `"${name}"`)
  const truncateQuery = `
    TRUNCATE TABLE
      ${quotedTableNames.join(",\n      ")}
    RESTART IDENTITY
    CASCADE;
  `
  try {
    // TODO: once all tables are in Sequelize models, use this instead:
    // await db.truncate({ cascade: true, restartIdentity: true })
    await db.query(truncateQuery, { raw: true })
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

beforeEach(async () => {
  await cleanDatabase()
})
