import { isNil } from "lodash"

import { VisualizationControl } from "@/models"
import { VisualizationControlsPolicy } from "@/policies"
import { VisualizationControlWithDataset } from "@/policies/visualization-controls-policy"
import { UpdateService } from "@/services/visualization-controls"

import BaseController from "@/controllers/base-controller"

export class VisualizationControlsController extends BaseController {
  async show() {
    const visualizationControl = await this.loadVisualizationControl()
    if (isNil(visualizationControl)) {
      return this.response.status(404).json({ message: "Visualization control not found." })
    }

    const policy = this.buildPolicy(visualizationControl)
    if (!policy.show()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to view this visualization control." })
    }

    return this.response.status(200).json({ visualizationControl })
  }

  async update() {
    const visualizationControl = await this.loadVisualizationControl()
    if (isNil(visualizationControl)) {
      return this.response.status(404).json({ message: "Visualization control not found." })
    }

    const policy = this.buildPolicy(visualizationControl)
    if (!policy.update()) {
      return this.response
        .status(403)
        .json({ message: "You are not authorized to update this visualization control." })
    }

    const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
    try {
      const updatedVisualizationControl = await UpdateService.perform(
        visualizationControl,
        permittedAttributes,
        this.currentUser
      )
      return this.response.status(200).json({ visualizationControl: updatedVisualizationControl })
    } catch (error) {
      return this.response
        .status(422)
        .json({ message: `Visualization control update failed: ${error}` })
    }
  }

  private async loadVisualizationControl(): Promise<VisualizationControlWithDataset | null> {
    const visualizationControl = await VisualizationControl.findByPk(
      this.params.visualizationControlId,
      {
        include: ["dataset"],
      }
    )
    return visualizationControl as VisualizationControlWithDataset | null
  }

  private buildPolicy(record: VisualizationControlWithDataset): VisualizationControlsPolicy {
    return new VisualizationControlsPolicy(this.currentUser, record)
  }
}

export default VisualizationControlsController
