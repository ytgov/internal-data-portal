import { DeepPartial } from "fishery"

import { Tagging } from "@/models"
import { TaggableTypes } from "@/models/tagging"
import BaseFactory from "@/factories/base-factory"

export const taggingFactory = BaseFactory.define<Tagging>(({ sequence, onCreate, params }) => {
  onCreate((tagging) => tagging.save())

  assertParamsHasTaggableId(params)
  assertParamsHasTaggableType(params)
  assertParamsHasTagId(params)

  return Tagging.build({
    id: sequence,
    taggableId: params.taggableId,
    taggableType: params.taggableType,
    tagId: params.tagId,
  })
})

function assertParamsHasTaggableId(
  params: DeepPartial<Tagging>
): asserts params is DeepPartial<Tagging> & { taggableId: number } {
  if (typeof params.taggableId !== "number") {
    throw new Error("taggableId is must be a number")
  }
}

function assertParamsHasTaggableType(
  params: DeepPartial<Tagging>
): asserts params is DeepPartial<Tagging> & { taggableType: TaggableTypes } {
  if (params.taggableType === undefined) {
    throw new Error("taggableType is required")
  }

  if (!Object.values(Tagging.TaggableTypes).includes(params.taggableType)) {
    throw new Error("taggableType is must be a TaggableTypes")
  }
}

function assertParamsHasTagId(
  params: DeepPartial<Tagging>
): asserts params is DeepPartial<Tagging> & { tagId: number } {
  if (typeof params.tagId !== "number") {
    throw new Error("tagId is must be a number")
  }
}

export default taggingFactory
