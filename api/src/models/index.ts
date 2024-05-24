import db from "@/db/db-client"

import { AccessGrant } from "@/models/access-grant"
import { AccessRequest } from "@/models/access-request"
import { Dataset } from "@/models/dataset"
import { DatasetEntry } from "@/models/dataset-entry"
import { DatasetEntryPreview } from "@/models/dataset-entry-preview"
import { DatasetField } from "@/models/dataset-field"
import { DatasetFile } from "@/models/dataset-file"
import { DatasetIntegration } from "@/models/dataset-integration"
import { DatasetStewardship } from "@/models/dataset-stewardship"
import { Role } from "@/models/role"
import { Tag } from "@/models/tag"
import { Tagging } from "@/models/tagging"
import { User } from "@/models/user"
import { UserGroup } from "@/models/user-groups"
import { UserGroupMembership } from "@/models/user-group-membership"
import { VisualizationControl } from "@/models/visualization-control"

AccessGrant.establishAssociations()
AccessRequest.establishAssociations()
Dataset.establishAssociations()
DatasetEntry.establishAssociations()
DatasetEntryPreview.establishAssociations()
DatasetField.establishAssociations()
DatasetFile.establishAssociations()
DatasetIntegration.establishAssociations()
DatasetStewardship.establishAssociations()
Role.establishAssociations()
Tag.establishAssociations()
Tagging.establishAssociations()
User.establishAssociations()
UserGroup.establishAssociations()
UserGroupMembership.establishAssociations()
VisualizationControl.establishAssociations()

export {
  AccessGrant,
  AccessRequest,
  Dataset,
  DatasetEntry,
  DatasetEntryPreview,
  DatasetField,
  DatasetFile,
  DatasetIntegration,
  DatasetStewardship,
  Role,
  Tag,
  Tagging,
  User,
  UserGroup,
  UserGroupMembership,
  VisualizationControl,
}

// special db instance that has access to all models.
export default db
