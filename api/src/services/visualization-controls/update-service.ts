import db, { DatasetField, User, VisualizationControl } from "@/models"

import BaseService from "@/services/base-service"

type DatasetFieldsAttributes = Pick<DatasetField, "id" | "isExcludedFromSearch">[]
type Attributes = Partial<VisualizationControl> & {
  searchExcludedDatasetFieldsAttributes?: DatasetFieldsAttributes
}

export class UpdateService extends BaseService {
  constructor(
    protected visualizationControl: VisualizationControl,
    protected attributes: Attributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<VisualizationControl> {
    return db.transaction(async () => {
      await this.visualizationControl.update(this.attributes)

      const { searchExcludedDatasetFieldsAttributes } = this.attributes
      if (searchExcludedDatasetFieldsAttributes) {
        await this.bulkReplaceSearchExcludeOnDatasetFields(searchExcludedDatasetFieldsAttributes)
      }

      // TODO: log user action

      return this.visualizationControl.reload({
        include: ["searchExcludedDatasetFields"],
      })
    })
  }

  private async bulkReplaceSearchExcludeOnDatasetFields(attributes: DatasetFieldsAttributes) {
    await DatasetField.update(
      {
        isExcludedFromSearch: false,
      },
      {
        where: {
          datasetId: this.visualizationControl.datasetId,
          isExcludedFromSearch: true,
        },
      }
    )
    const datasetFieldIds = attributes
      .filter((attributes) => attributes.isExcludedFromSearch)
      .map((attributes) => attributes.id)
    await DatasetField.update(
      {
        isExcludedFromSearch: true,
      },
      {
        where: {
          id: datasetFieldIds,
        },
      }
    )
  }
}

export default UpdateService
