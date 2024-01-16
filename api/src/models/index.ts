import db from "@/db/db-client"

import { Role } from "@/models/role"
import { User } from "@/models/user"

// Estabilish associations between models, order likely matters
Role.establishAssociations()
User.establishAssociations()

// special db instance that has access to all models.
export default db
