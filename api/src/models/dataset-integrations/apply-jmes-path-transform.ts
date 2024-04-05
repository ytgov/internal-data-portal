import { isArray, isNil } from "lodash"
import { search } from "jmespath"

import DatasetIntegration from "@/models/dataset-integration"

export function applyJMESPathTransform(datasetIntegration: DatasetIntegration) {
  const { rawJsonData, jmesPathTransform } = datasetIntegration

  if (isNil(rawJsonData)) {
    throw new Error("An integration must have data to be parsed.")
  }

  if (isNil(jmesPathTransform) && isArray(rawJsonData)) {
    return datasetIntegration.set({
      parsedJsonData: rawJsonData,
    })
  }

  if (isNil(jmesPathTransform)) {
    throw new Error("An integration must parse to an array to be valid")
  }

  const parsedJsonData = search(rawJsonData, jmesPathTransform)
  return datasetIntegration.set({
    parsedJsonData,
  })
}

export default applyJMESPathTransform
