import axios from "axios"
import { isArray, isNil, isString } from "lodash"
import jmespath from "jmespath"

import db, { DatasetEntry, DatasetIntegration, User } from "@/models"
import {
  DatasetIntegrationRawJsonDataType,
  DatasetIntegrationStatusTypes,
} from "@/models/dataset-integration"

import BaseService from "@/services/base-service"
import { CreationAttributes } from "sequelize"
import { DatasetEntryJsonDataType } from "@/models/dataset-entry"

type Attributes = Partial<DatasetIntegration>

export class UpdateService extends BaseService {
  constructor(
    private datasetIntegration: DatasetIntegration,
    private attributes: Attributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<DatasetIntegration> {
    const { url, headerKey, headerValue } = this.attributes

    let status: DatasetIntegrationStatusTypes = this.datasetIntegration.status
    let rawJsonData: DatasetIntegrationRawJsonDataType | null = this.datasetIntegration.rawJsonData
    let lastSuccessAt: Date | null = this.datasetIntegration.lastSuccessAt
    if (
      (!isNil(url) && url !== this.datasetIntegration.url) ||
      (!isNil(headerKey) && headerKey !== this.datasetIntegration.headerKey) ||
      (!isNil(headerValue) && headerValue !== this.datasetIntegration.headerValue)
    ) {
      let headers = {}
      if (!isNil(headerKey)) {
        headers = { [headerKey]: headerValue }
      }

      // This should not be required, but TypeScript is flaking.
      if (isNil(url)) {
        throw new Error("URL is required")
      }

      try {
        rawJsonData = await this.fetchRawIntegrationData(url, headers)
        status = DatasetIntegrationStatusTypes.OK
        lastSuccessAt = new Date()
      } catch (error) {
        throw new Error(`Failed to establish integration with ${url}: ${error}`)
      }
    }

    return db.transaction(async () => {
      await this.datasetIntegration.update({
        ...this.attributes,
        status,
        rawJsonData,
        lastSuccessAt,
      })

      await this.parseJsonData(this.datasetIntegration)
      await this.bulkReplaceDatasetEntries(this.datasetIntegration)

      // TODO: log user action

      return this.datasetIntegration
    })
  }

  private async fetchRawIntegrationData(
    url: string,
    headers?: Record<string, string>
  ): Promise<DatasetIntegrationRawJsonDataType> {
    const { data } = await axios.get(url, {
      headers,
    })

    return data
  }

  private async parseJsonData(datasetIntegration: DatasetIntegration) {
    const { rawJsonData, jmesPathTransform } = datasetIntegration

    if (isNil(rawJsonData)) {
      throw new Error("An integration must have data to be parsed.")
    }

    if (isNil(jmesPathTransform) && isArray(rawJsonData)) {
      return datasetIntegration.update({
        parsedJsonData: rawJsonData,
      })
    }

    if (isNil(jmesPathTransform)) {
      throw new Error("An integration must parse to an array to be valid")
    }

    const parsedJsonData = jmespath.search(rawJsonData, jmesPathTransform)
    return datasetIntegration.update({
      parsedJsonData,
    })
  }

  private async bulkReplaceDatasetEntries(datasetIntegration: DatasetIntegration) {
    const { datasetId, parsedJsonData } = datasetIntegration

    await DatasetEntry.destroy({
      where: {
        datasetId,
      },
    })

    if (isNil(parsedJsonData)) {
      throw new Error("An integration must have data to build data entries.")
    }

    const datasetEntriesAttributes: CreationAttributes<DatasetEntry>[] = parsedJsonData.map(
      (rawJsonData) => {
        let jsonData: DatasetEntryJsonDataType
        if (isString(rawJsonData)) {
          jsonData = {
            title: rawJsonData,
            value: rawJsonData,
          } as DatasetEntryJsonDataType
        } else {
          jsonData = rawJsonData as DatasetEntryJsonDataType
        }

        return {
          datasetId,
          rawJsonData,
          jsonData,
        }
      }
    )
    await DatasetEntry.bulkCreate(datasetEntriesAttributes)
    return
  }
}

export default UpdateService
