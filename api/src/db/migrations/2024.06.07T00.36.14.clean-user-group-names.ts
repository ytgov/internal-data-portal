import type { Migration } from "@/db/umzug"
import { UserGroup } from "@/models"

export const up: Migration = async () => {
  await UserGroup.findEach(async (userGroup) => {
    await userGroup.update({
      name: userGroup.name.trim().replace(/\s+/g, " "),
    })
  })
}

export const down: Migration = async () => {
  // no-op
}
