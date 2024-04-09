# Services

Services are responsible for handling the business logic of the application.

## Structure

All services should implement:

1. an _instance_ method `perform`
2. and an optional `constructor` if the service accepts arguments.

The `BaseService` maps the _static_ method `perform` to the _instance_ method `perform` with the arguments from the `constructor`.

```typescript
SomeService.perform()
```

does

```typescript
const someSerive = new SomeService()
someService.perform()
```

```typescript
SomeService.perform(arg1, arg2)
```

does

```typescript
const someSerive = new SomeService(arg1, arg2)
someService.perform()
```

## Folder Structure

In the simplest case, service folder structure should map to controller structure and method action.

e.g.

- `controllers/datasets-controller.ts`, which constains `DatasetsController#update` and `DatasetsController#create` should have matching services `UpdateService` and `CreateService` located in `services/datasets/create-service` and `services/datasets/update-service.ts`.
- `controllers/datasets/download-controller.ts` should have a matching service `CreateService` located in `services/datasets/download/create-service.ts`.

In more complex cases, sub-services can exist in the same folder as the main service.
For example, `services/dataset-integrations/activate-service.ts` acts as a sub-service of the main `services/dataset-integrations/create-service.ts` and also as a sub-service of `services/dataset-integrations/update-service.ts`. This service might still be useful in other contexts, so it is not nested in the `create-service` or `update-service` folders, but is directly accessible.

Primary services can also simply split the main logic down two paths such as in the
`services/datasets/download/create-service.ts` which splits the logic into `services/datasets/download/create-from-file-service.ts` and `services/datasets/download/create-from-integration-service.ts`.
