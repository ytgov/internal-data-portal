// Runs once before all tests

// sketchy hack to load paths, I'm pretty sure this isn't how its supposed to be used
import "tsconfig-paths/register"

import { importAndExecuteInitializers } from "@/initializers"

export default async function globalSetup() {
  // TODO: exclude seeding, or at least separate development and test seeding
  await importAndExecuteInitializers()
}
