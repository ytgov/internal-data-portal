import { Op, WhereOptions, col, fn, where } from "sequelize"
import { isEmpty, isNil } from "lodash"

import { User } from "@/models"
import { UserSerializers } from "@/serializers"

import BaseController from "@/controllers/base-controller"

export class SearchController extends BaseController {
  async index() {
    const searchQuery = this.buildSearchQuery()

    const totalCount = await User.count({ where: searchQuery })
    const users = await User.findAll({
      where: searchQuery,
      limit: this.pagination.limit,
      offset: this.pagination.offset,
      include: [
        "roles",
        {
          association: "groupMembership",
          include: ["department", "division", "branch", "unit"],
        },
      ],
    })

    const serializedUsers = UserSerializers.asDetailedTable(users)
    return this.response.json({ users: serializedUsers, totalCount })
  }

  // TODO: implement fuzzy weighted search via MSSQL full-text search CONTAINSTABLE
  // Probable would be best to do this in a service for easier testing.
  private buildSearchQuery(): WhereOptions<User> {
    const searchToken = this.params.searchToken.toLowerCase()
    if (isNil(searchToken) || isEmpty(searchToken)) {
      return {}
    }

    const parts = searchToken.split(" ")
    if (parts.length === 1) {
      return {
        [Op.or]: [
          where(fn("LOWER", col("email")), { [Op.like]: `%${searchToken}%` }),
          where(fn("LOWER", col("first_name")), { [Op.like]: `%${searchToken}%` }),
          where(fn("LOWER", col("last_name")), { [Op.like]: `%${searchToken}%` }),
          where(fn("LOWER", col("position")), { [Op.like]: `%${searchToken}%` }),
        ],
      }
    }

    return {
      [Op.and]: parts.map((part) => ({
        [Op.or]: [
          where(fn("LOWER", col("email")), { [Op.like]: `%${part}%` }),
          where(fn("LOWER", col("first_name")), { [Op.like]: `%${part}%` }),
          where(fn("LOWER", col("last_name")), { [Op.like]: `%${part}%` }),
          where(fn("LOWER", col("position")), { [Op.like]: `%${part}%` }),
        ],
      })),
    }
  }
}

export default SearchController
