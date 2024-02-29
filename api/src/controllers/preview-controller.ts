import axios from "axios"

import BaseController from "@/controllers/base-controller"

export class PreviewController extends BaseController {
  async create() {
    try {
      const { externalApiUrl, externalApiHeaderKey, externalApiHeaderValue } = this.request.body
      const { data } = await axios.get(externalApiUrl, {
        headers: {
          [externalApiHeaderKey]: externalApiHeaderValue,
        },
      })
      return this.response.status(201).json(data)
    } catch (error) {
      console.error(error)
      return this.response.status(422).json({ message: `Preview generation failed: ${error}` })
    }
  }
}

export default PreviewController
