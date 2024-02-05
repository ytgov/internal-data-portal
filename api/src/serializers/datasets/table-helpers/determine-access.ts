import { Dataset, User } from "@/models"
import { AccessTypes } from "@/models/access-grant"


export function determineAccess(record: Dataset, currentUser: User): AccessTypes {
  return 'TODO' as any
}

export default determineAccess
