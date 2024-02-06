import { Sequelize } from "sequelize"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sequelizeVersion = (Sequelize as any).version
const major = sequelizeVersion.split(".").map(Number)[0]

if (major >= 7) {
  console.warn("This patch was probably made redundant in Sequelize v7, you should check!")
}

/**
 * Fixed in Sequelize v7, but hasn't been back-ported to Sequelize v6.
 * See https://github.com/sequelize/sequelize/issues/14807#issuecomment-1854398131
 */
export function monkeyPatchSequelizeErrorsForJest(instance: Sequelize) {
  if (typeof jest === "undefined") return instance

  const origQueryFunc = instance.query
  instance.query = async function query(this: Sequelize, ...args: any[]) {
    let result
    try {
      result = await origQueryFunc.apply(this, args as any)
    } catch (err: any) {
      console.error(err) // Important - this is how we debug the error
      throw err
    }
    return result
  } as typeof origQueryFunc

  return instance
}
