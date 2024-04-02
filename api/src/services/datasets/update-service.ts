import { isEmpty, isNil } from "lodash"

import { Dataset, User } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Partial<Dataset>

export class UpdateService extends BaseService {
  constructor(
    private dataset: Dataset,
    private attributes: Attributes,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<Dataset> {
    const { isLiveData, publishedAt, ...otherAttributes } = this.attributes

    if (isLiveData && isEmpty(publishedAt)) {
      throw new Error("publishedAt is required when isLiveData is true")
    }

    if (isNil(isLiveData) && !isEmpty(publishedAt)) {
      throw new Error("isLiveData is required when publishedAt is provided")
    }

    await this.dataset.update({
      isLiveData,
      publishedAt,
      ...otherAttributes,
    })

    // TODO: log user who performed update?

    return this.dataset.reload({
      include: [
        {
          association: "owner",
          include: [
            {
              association: "groupMembership",
              include: ["department", "division", "branch", "unit"],
            },
          ],
        },
        "creator",
        "integration",
        "stewardship",
        "accessGrants",
        "accessRequests",
        "visualizationControl",
      ],
    })
  }
}

export default UpdateService
