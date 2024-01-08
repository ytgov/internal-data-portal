import type { SeedMigration } from "@/db/umzug"

export const up: SeedMigration = async () => {
// export const up: SeedMigration = async ({ context: { User } }) => {
  // await User.findOrCreate({
  //   where: {
  //     email: "example.user@yukon.ca",
  //   },
  //   defaults: {
  //     email: "example.user@yukon.ca",
  //     firstName: "Example",
  //     lastName: "User",
  //     auth0Subject: "auth0|example123",
  //     department: "Finance",
  //     division: "Accounting",
  //     branch: "Revenue",
  //     unit: "Tax",
  //     position: "Data Analyst",
  //   },
  // })
}

export const down: SeedMigration = async () => {
  // this method needs to exist, but does not need to be implemented.
  // Seeds should be idempotent.
}
