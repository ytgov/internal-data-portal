import { faker } from "@faker-js/faker"

import { StewardshipEvolution } from "@/models"

import BaseFactory from "@/factories/base-factory"

export const stewardshipEvolutionFactory = BaseFactory.define<StewardshipEvolution>(
  ({ sequence, onCreate }) => {
    onCreate((stewardshipEvolution) => stewardshipEvolution.save())

    return StewardshipEvolution.build({
      id: sequence,
      ownerName: faker.person.fullName(),
      ownerPosition: faker.person.jobTitle(),
      supportName: faker.person.fullName(),
      supportEmail: faker.internet.email(),
      supportPosition: faker.person.jobTitle(),
      department: `Department ${sequence}`,
      division: faker.datatype.boolean(0.5) ? `Division ${sequence}` : null,
      branch: faker.datatype.boolean(0.3) ? `Branch ${sequence}` : null,
      unit: faker.datatype.boolean(0.1) ? `Unit ${sequence}` : null,
    })
  }
)

export default stewardshipEvolutionFactory
