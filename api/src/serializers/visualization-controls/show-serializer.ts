import { isUndefined, pick } from "lodash"

import { SearchFieldExclusion, User, VisualizationControl } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type VisualizationControlShowView = Partial<VisualizationControl> & {
  searchFieldExclusions: SearchFieldExclusion[]
}

export class ShowSerializer extends BaseSerializer<VisualizationControl> {
  constructor(
    protected record: VisualizationControl,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): VisualizationControlShowView {
    if (isUndefined(this.record.searchFieldExclusions)) {
      throw new Error("Expected record to have a searchFieldExclusions association")
    }

    return {
      ...pick(this.record.dataValues, [
        "id",
        "datasetId",
        "isDowloadableAsCsv",
        "hasSearchRestrictions",
        "hasSearchFieldRestrictions",
        "hasSearchRowLimits",
        "searchRowLimitMaximum",
        "createdAt",
        "updatedAt",
      ]),
      searchFieldExclusions: this.record.searchFieldExclusions,
    }
  }
}

export default ShowSerializer
