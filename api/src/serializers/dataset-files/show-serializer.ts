import { pick } from "lodash"

import { DatasetFile, User } from "@/models"

import BaseSerializer from "@/serializers/base-serializer"

export type DatasetFileShowView = Pick<
  DatasetFile,
  "id" | "datasetId" | "name" | "sizeInBytes" | "mimeType" | "md5Hash"
>

export class ShowSerializer extends BaseSerializer<DatasetFile> {
  constructor(
    protected record: DatasetFile,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): DatasetFileShowView {
    return {
      ...pick(
        this.record.dataValues,
        "id",
        "datasetId",
        "name",
        "sizeInBytes",
        "mimeType",
        "md5Hash"
      ),
    }
  }
}
