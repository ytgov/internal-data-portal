export function arrayToSqlList(array: string[]): string {
  return `'${Object.values(array).join(`', '`)}'`
}
