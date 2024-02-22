export function compactSql(sql: string) {
  return sql.replace(/\s+/g, " ").trim()
}
