# Serializers

Serializers take model data, in the form mapping directly to the database structure, but with any casing standardize to JS standard. Data is then converted to a standard format that matches an external view as seen in the front-end.

Serializers are used in controllers to convert from a database representation to a front-end data packet. Serializers should generally not be used for general data formating such as date or money formatting, as formatting those kinds of things in the front-end is generally more flexible.

e.g. Usage in a Controller might look like this

```typescript
export class FormsController extends BaseController {
  index() {
    return Form.findAll({
      where: { userId: this.currentUser.id },
      include: ["stops", "purpose"],
    }).then((forms) => {
      const serializedForms = FormSerializer.asTable(forms)
      return this.response.json({ forms: serializedForms })
    })
  }
}
```
