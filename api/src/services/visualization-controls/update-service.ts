import db, { SearchFieldExclusion, User, VisualizationControl } from "@/models"

import BaseService from "@/services/base-service"

type SearchFieldExclusionsAttributes = Pick<SearchFieldExclusion, "datasetFieldId">[]
type Attributes = Partial<VisualizationControl> & {
  searchFieldExclusionsAttributes?: SearchFieldExclusionsAttributes
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
      this.visualizationControl.update(this.attributes)

      const { searchFieldExclusionsAttributes } = this.attributes
      console.log(`searchFieldExclusionsAttributes:`, searchFieldExclusionsAttributes)
      if (searchFieldExclusionsAttributes) {
        await this.bulkReplaceSearchFieldExclusions(searchFieldExclusionsAttributes)
      }

      // TODO: log user action

      return this.visualizationControl.reload({
        include: ["searchFieldExclusions"],
      })
    })
  }

  private async bulkReplaceSearchFieldExclusions(attributes: SearchFieldExclusionsAttributes) {
    await SearchFieldExclusion.destroy({
      where: { visualizationControlId: this.visualizationControl.id },
    })
    const secureAttributes = attributes.map((attributes) => ({
      ...attributes,
      visualizationControlId: this.visualizationControl.id,
    }))
    await SearchFieldExclusion.bulkCreate(secureAttributes)
  }
}

export default UpdateService
