import BaseController from "./base-controller"

import { UserSerializers } from "@/serializers"

export class CurrentUserController extends BaseController {
  async show() {
    const serializedUser = UserSerializers.asDetailed(this.currentUser)
    return this.response.status(200).json({ user: serializedUser })
  }
}

export default CurrentUserController
