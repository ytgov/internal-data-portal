import { User, VisualizationControl } from "@/models"

import BaseService from "@/services/base-service"

export class UpdateService extends BaseService {
  constructor(
    protected visualizationControl: VisualizationControl,
    protected attributes: Partial<VisualizationControl>,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<VisualizationControl> {
    this.visualizationControl.update(this.attributes)

    // TODO: log user action

    return this.visualizationControl
  }
}

export default UpdateService
