import db from "@/db/db-client"

import { Role } from "@/models/role"
import { User } from "@/models/user"
import { Dataset } from "@/models/dataset"
import { StewardshipEvolutions } from "@/models/stewardship-evolution"

// Estabilish associations between models, order likely matters
Role.establishAssociations()
User.establishAssociations()
Dataset.establishAssociations()
StewardshipEvolutions.establishAssociations()

export { Role, User, Dataset, StewardshipEvolutions }

// special db instance that has access to all models.
export default db
