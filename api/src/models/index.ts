import db from "@/db/db-client"

import { Role } from "@/models/role"
import { User } from "@/models/user"
import { Dataset } from "@/models/dataset"
import { StewardshipEvolution } from "@/models/stewardship-evolution"
import { UserGroup } from "@/models/user-groups"
import { UserGroupMembership } from "@/models/user-group-membership"
import { Tag } from "@/models/tag"
import { Tagging } from "@/models/tagging"

// Estabilish associations between models, order likely matters
Role.establishAssociations()
User.establishAssociations()
Dataset.establishAssociations()
StewardshipEvolution.establishAssociations()
UserGroup.establishAssociations()
UserGroupMembership.establishAssociations()
Tag.establishAssociations()
Tagging.establishAssociations()

export { Role, User, Dataset, StewardshipEvolution, UserGroup, UserGroupMembership, Tag, Tagging }

// special db instance that has access to all models.
export default db
