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
    await this.dataset.update(this.attributes)

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
        "file",
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
