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

import db from "@/models"

// Global Mocks
import "@/support/mock-current-user"
import "@/support/mock-axios"

/*
  e.g.
  EXEC sp_msforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';
  DELETE FROM table1 WHERE 1=1;
  DELETE FROM table2 WHERE 1=1;
  ...
  DBCC CHECKIDENT ('table1', RESEED, 0);
  DBCC CHECKIDENT ('table2', RESEED, 0);
  ...
  EXEC sp_msforeachtable 'ALTER TABLE ? CHECK CONSTRAINT ALL';
*/
const tableNames = Object.values(db.models).map((model) => model.tableName)
const disableAllConstraintsQuery = "EXEC sp_msforeachtable 'ALTER TABLE ? NOCHECK CONSTRAINT ALL';"
const deleteAllInAllTablesQuery = tableNames
  .map((tableName) => `DELETE FROM ${tableName} WHERE 1=1;`)
  .join("\n")
const resetIdentityColumnsQuery = tableNames
  .map((tableName) => `DBCC CHECKIDENT ('${tableName}', RESEED, 0);`)
  .join("\n")
const enableAllConstraintsQuery = "EXEC sp_msforeachtable 'ALTER TABLE ? CHECK CONSTRAINT ALL';"
const cleanupQuery = [
  disableAllConstraintsQuery,
  deleteAllInAllTablesQuery,
  resetIdentityColumnsQuery,
  enableAllConstraintsQuery,
].join("\n")

async function cleanDatabase() {
  try {
    await db.query(cleanupQuery, { raw: true }).catch(console.error)
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

beforeEach(async () => {
  await cleanDatabase()
})
