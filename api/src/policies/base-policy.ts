import { User } from "@/models"
import { Path, deepPick } from "@/utils/deep-pick"

export type Actions = "show" | "create" | "update" | "destroy"

export class BasePolicy<Model> {
  protected user: User
  protected record: Model

  constructor(user: User, record: Model) {
    this.user = user
    this.record = record
  }

  show(): boolean {
    return false
  }

  create(): boolean {
    return false
  }

  update(): boolean {
    return false
  }

  destroy(): boolean {
    return false
  }

  // TODO: add scope method to base policy, see travel-authorizations-policy.ts

  permitAttributes(record: Partial<Model>): Partial<Model> {
    return deepPick(record, this.permittedAttributes())
  }

  permitAttributesForCreate(record: Partial<Model>): Partial<Model> {
    if (this.permittedAttributesForCreate !== BasePolicy.prototype.permittedAttributesForCreate) {
      return deepPick(record, this.permittedAttributesForCreate())
    } else {
      return deepPick(record, this.permittedAttributes())
    }
  }

  permitAttributesForUpdate(record: Partial<Model>): Partial<Model> {
    if (this.permittedAttributesForUpdate !== BasePolicy.prototype.permittedAttributesForUpdate) {
      return deepPick(record, this.permittedAttributesForUpdate())
    } else {
      return deepPick(record, this.permittedAttributes())
    }
  }

  permittedAttributes(): Path[] {
    throw new Error("Not Implemented")
  }

  permittedAttributesForCreate(): Path[] {
    throw new Error("Not Implemented")
  }

  permittedAttributesForUpdate(): Path[] {
    throw new Error("Not Implemented")
  }

  /**
   * Add to support return policy information via this.reponse.json({ someObject, policy })
   *
   * If this method becomes complex, it should be broken out into a serializer.
   *
   * @returns a JSON representation of the policy
   */
  toJSON(): Record<Actions, boolean> {
    return {
      show: this.show(),
      create: this.create(),
      update: this.update(),
      destroy: this.destroy(),
    }
  }
}

export default BasePolicy
