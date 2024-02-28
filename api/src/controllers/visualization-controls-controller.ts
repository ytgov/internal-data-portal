import { isNil } from "lodash"

import { VisualizationControl } from "@/models"
import { VisualizationControlsPolicy } from "@/policies"
import { UpdateService } from "@/services/visualization-controls"
import { ShowSerializer } from "@/serializers/visualization-controls"

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

    try {
      const serializedVisualizationControl = ShowSerializer.perform(
        visualizationControl,
        this.currentUser
      )
      return this.response
        .status(200)
        .json({ visualizationControl: serializedVisualizationControl })
    } catch (error) {
      return this.response
        .status(500)
        .json({ message: `Visualization controller serialization failed: ${error}` })
    }
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

    let updatedVisualizationControl: VisualizationControl
    try {
      updatedVisualizationControl = await UpdateService.perform(
        visualizationControl,
        permittedAttributes,
        this.currentUser
      )
    } catch (error) {
      return this.response
        .status(422)
        .json({ message: `Visualization control update failed: ${error}` })
    }

    try {
      const serializedVisualizationControl = ShowSerializer.perform(
        updatedVisualizationControl,
        this.currentUser
      )
      return this.response
        .status(200)
        .json({ visualizationControl: serializedVisualizationControl })
    } catch (error) {
      return this.response
        .status(500)
        .json({ message: `Visualization controller serialization failed: ${error}` })
    }
  }

  private async loadVisualizationControl(): Promise<VisualizationControl | null> {
    return VisualizationControl.findByPk(this.params.visualizationControlId, {
      include: [
        {
          association: "dataset",
          include: [
            {
              association: "owner",
              include: ["groupMembership"],
            },
            "accessGrants",
            "accessRequests",
          ],
        },
        "searchFieldExclusions",
      ],
    })
  }

  private buildPolicy(record: VisualizationControl): VisualizationControlsPolicy {
    return new VisualizationControlsPolicy(this.currentUser, record)
  }
}

export default VisualizationControlsController
