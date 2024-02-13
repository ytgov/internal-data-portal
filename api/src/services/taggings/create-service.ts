import { isNil } from "lodash"

import db, { Tag, Tagging, User } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Partial<Tagging> & {
  tagAttributes: Partial<Tag>
}

export class CreateService extends BaseService {
  private attributes: Partial<Tagging>
  private tagAttributes: Partial<Tag>

  constructor(
    { tagAttributes, ...attributes }: Attributes,
    private currentUser: User
  ) {
    super()
    this.attributes = attributes
    this.tagAttributes = tagAttributes
  }

  async perform(): Promise<Tagging> {
    const { taggableType, taggableId, tagId } = this.attributes

    if (isNil(taggableType) || isNil(taggableId)) {
      throw new Error("taggableType and taggableId are required")
    }

    return db.transaction(async () => {
      let effectiveTagId: number
      if (isNil(tagId)) {
        const { name } = this.tagAttributes
        if (isNil(name)) {
          throw new Error("tagAttributes.name is required when tagId was not provided")
        }

        const cleanName = name.trim().toLocaleLowerCase()
        const tag = await Tag.create({ name: cleanName })

        if (isNil(tag)) {
          throw new Error("Tag creation failed")
        }

        effectiveTagId = tag.id
      } else {
        effectiveTagId = tagId
      }

      const tagging = await Tagging.create({
        taggableType,
        taggableId,
        tagId: effectiveTagId,
      })

      // TODO: log creating user?

      return tagging.reload({ include: ["tag"] })
    })
  }
}

export default CreateService
