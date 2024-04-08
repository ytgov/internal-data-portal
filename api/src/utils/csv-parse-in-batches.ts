import { type CsvParserStream } from "fast-csv"

export function csvParseInBatches<BatchResult, Row = Record<string, unknown>>(
  stream: CsvParserStream<string[], string[]>,
  processHeaders: (headers: string[]) => Promise<void>,
  processBatch: (batch: Row[]) => Promise<BatchResult>,
  {
    batchSize = 1000,
  }: {
    batchSize?: number
  } = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    let batch: Row[] = []

    stream.on("headers", (headers: string[]) => {
      stream.pause()
      processHeaders(headers)
        .then(() => stream.resume())
        .catch(reject)
    })

    stream.on("data", (item: Row) => {
      batch.push(item)
      if (batch.length >= batchSize) {
        stream.pause()
        processBatch(batch)
          .then(() => {
            batch = []
            stream.resume()
          })
          .catch(reject)
      }
    })

    stream.on("end", () => {
      if (batch.length > 0) {
        processBatch(batch)
          .then(() => resolve())
          .catch(reject)
      } else {
        resolve()
      }
    })

    stream.on("error", reject)
  })
}
