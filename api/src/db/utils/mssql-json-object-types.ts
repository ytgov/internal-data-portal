/**
 * See https://learn.microsoft.com/en-us/sql/t-sql/functions/openjson-transact-sql?view=sql-server-ver16#return-value
 */
export enum JsonDataType {
  NULL = 0,
  STRING = 1,
  NUMBER = 2,
  BOOLEAN = 3,
  ARRAY = 4,
  OBJECT = 5,
}
