import { User } from "@/models"

import BaseService from "@/services/base-service"
import { yukonGovernmentIntegration } from "@/integrations"

export class YukonGovernmentDirectorySyncService extends BaseService {
  private user: User

  constructor(user: User) {
    super()
    this.user = user
  }

  async perform(): Promise<User> {
    const email = this.user.email

    try {
      const { employee } = await yukonGovernmentIntegration.fetchEmpolyee(email)

      await this.user.update({
        department: employee.department,
        division: employee.division,
        branch: employee.branch,
        unit: employee.unit,
        lastEmployeeDirectorySyncAt: new Date(),
      })

      return this.user
    } catch (error) {
      console.log("Failed to sync user with yukon government directory", error)
      await this.user.update({
        lastEmployeeDirectorySyncAt: new Date(),
      })
      return this.user
    }
  }
}

export default YukonGovernmentDirectorySyncService
