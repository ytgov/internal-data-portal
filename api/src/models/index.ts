import db from "@/db/db-client"

import { Role } from "@/models/role"
import { User } from "@/models/user"
import { Dataset } from "@/models/dataset"
import { DatasetStewardship } from "@/models/dataset-stewardship"
import { StewardshipEvolution } from "@/models/stewardship-evolution"
import { UserGroup } from "@/models/user-groups"
import { UserGroupMembership } from "@/models/user-group-membership"
import { Tag } from "@/models/tag"
import { Tagging } from "@/models/tagging"
import { AccessGrant } from "@/models/access-grant"
import { AccessRequest } from "@/models/access-request"
import { DatasetField } from "@/models/dataset-field"
import { VisualizationControl } from "@/models/visualization-control"
import { SearchFieldExclusion } from "@/models/search-field-exclusion"
import { DatasetEntry } from "@/models/dataset-entry"

// Estabilish associations between models, order likely matters
Role.establishAssociations()
User.establishAssociations()
Dataset.establishAssociations()
StewardshipEvolution.establishAssociations()
UserGroup.establishAssociations()
UserGroupMembership.establishAssociations()
Tag.establishAssociations()
Tagging.establishAssociations()
AccessGrant.establishAssociations()
AccessRequest.establishAssociations()
DatasetStewardship.establishAssociations()
DatasetField.establishAssociations()
VisualizationControl.establishAssociations()
SearchFieldExclusion.establishAssociations()
DatasetEntry.establishAssociations()

export {
  AccessGrant,
  AccessRequest,
  Dataset,
  DatasetEntry,
  DatasetField,
  DatasetStewardship,
  Role,
  SearchFieldExclusion,
  StewardshipEvolution,
  Tag,
  Tagging,
  User,
  UserGroup,
  UserGroupMembership,
  VisualizationControl,
}

// special db instance that has access to all models.
export default db
