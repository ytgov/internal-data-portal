import { pick } from "lodash"

import { User } from "@/models"

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
    return pick(record, this.permittedAttributes())
  }

  permitAttributesForCreate(record: Partial<Model>): Partial<Model> {
    if (this.permittedAttributesForCreate !== BasePolicy.prototype.permittedAttributesForCreate) {
      return pick(record, this.permittedAttributesForCreate())
    } else {
      return pick(record, this.permittedAttributes())
    }
  }

  permitAttributesForUpdate(record: Partial<Model>): Partial<Model> {
    if (this.permittedAttributesForUpdate !== BasePolicy.prototype.permittedAttributesForUpdate) {
      return pick(record, this.permittedAttributesForUpdate())
    } else {
      return pick(record, this.permittedAttributes())
    }
  }

  permittedAttributes(): string[] {
    throw new Error("Not Implemented")
  }

  permittedAttributesForCreate(): string[] {
    throw new Error("Not Implemented")
  }

  permittedAttributesForUpdate(): string[] {
    throw new Error("Not Implemented")
  }
}

export default BasePolicy
