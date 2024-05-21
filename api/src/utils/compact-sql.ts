export function compactSql(sql: string) {
  const multiLineCommentPattern = /\/\*[\s\S]*?\*\//g
  const singleLineCommentPattern = /--.*$/gm
  const multiWhitespacePattern = /\s+/g

  return sql
    .replace(multiLineCommentPattern, "")
    .replace(singleLineCommentPattern, "")
    .replace(multiWhitespacePattern, " ")
    .trim()
}
