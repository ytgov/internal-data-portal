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

async function cleanDatabase() {
  try {
    await db.truncate({ cascade: true, restartIdentity: true })
    return true
  } catch (error) {
    console.error(error)
    return false
  }
}

beforeEach(async () => {
  await cleanDatabase()
})
