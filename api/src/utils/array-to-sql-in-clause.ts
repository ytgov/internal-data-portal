export function arrayToSqlInClause(array: string[]): string {
  return `'${Object.values(array).join(`', '`)}'`
}
