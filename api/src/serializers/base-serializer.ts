export class BaseSerializer<Model> {
  protected record: Model

  constructor(record: Model) {
    this.record = record
  }

  static perform<Model>(record: Model): any {
    const serializer = new this(record)
    return serializer.perform()
  }

  perform() {
    throw new Error("Not Implemented")
  }
}

export default BaseSerializer
