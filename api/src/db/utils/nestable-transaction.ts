import { Sequelize, Transaction, TransactionOptions } from "sequelize"

import db, { transactionManager } from "@/db/db-client"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const sequelizeVersion = (Sequelize as any).version
const major = sequelizeVersion.split(".").map(Number)[0]

if (major >= 7) {
  console.warn("nestableTransaction is no longer needed in Sequelize v7!")
}

/*
Operates just like Sequelize transaction, but nests by default.

e.g. Using this function is the equivalent of using the following code:
db.transaction((t1) => {
  // lots of layers of other code
  db.transaction({ transaction: t1 }, () => {
    // Your nested transaction logic here
  });
});

But without the hassle of having to pass the transaction object around.
*/
export function nestableTransaction<T>(
  options: TransactionOptions,
  autoCallback: (t: Transaction) => PromiseLike<T>
): Promise<T>
export function nestableTransaction<T>(autoCallback: (t: Transaction) => PromiseLike<T>): Promise<T>
export function nestableTransaction(options?: TransactionOptions): Promise<Transaction>
export function nestableTransaction<T>(
  optionsOrAutoCallback?: TransactionOptions | ((t: Transaction) => PromiseLike<T>),
  autoCallback?: (t: Transaction) => PromiseLike<T>
) {
  const parentTransaction = transactionManager.get("transaction")
  if (typeof optionsOrAutoCallback === "object" && typeof autoCallback === "function") {
    return db.transaction(
      {
        ...optionsOrAutoCallback,
        transaction: parentTransaction,
      },
      autoCallback
    )
  } else if (typeof optionsOrAutoCallback === "function" && autoCallback === undefined) {
    return db.transaction(
      {
        transaction: parentTransaction,
      },
      optionsOrAutoCallback
    )
  } else {
    return db.transaction({
      ...optionsOrAutoCallback,
      transaction: parentTransaction,
    })
  }
}

export default nestableTransaction
