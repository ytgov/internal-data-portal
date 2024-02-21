# Internal Data Portal

## General Stack

### API (Back-end)

- [Node](https://nodejs.org/en) + [Express](https://expressjs.com/)

- [Typescript](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html)

- [Knex](https://knexjs.org/guide/)

### Front-End

- [Vue 3](https://vuejs.org/guide/introduction.html) + [Vuetify](https://vuetifyjs.com/en/getting-started/installation/#installation)

- [Typescript](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch.html)

- [Axios](https://github.com/axios/axios)

### Database

- Microsoft SQL Server - [MSSQL](https://www.postgresql.org/docs/current/app-psql.html)

- [Docker Compose](https://docs.docker.com/compose/compose-file/)

---

## Development

1. In both the `api` and `web` folder.

2. Create a `.env.development` file with this content. It must match the config in `docker-compose.development.yml`

   ```bash
   VITE_AUTH0_DOMAIN=https://dev-0tc6bn14.eu.auth0.com
   VITE_AUTH0_AUDIENCE=testing
   VITE_AUTH0_CLIENT_ID=ZHjPOeCwYBov6eR1lxGOVYhYi4VPV8eU
   ```

3. Go back to the top level directory.

4. [Set up the `dev`](#set-up-dev-command) command, or use `docker compose -f docker-compose.development.yml` instead of `dev` in all instructions.

5. Boot the api, web, and db services via `dev up` or `docker compose -f docker-compose.development.yml up`. This will run the boot pipeline and create the database, run migrations, and run seeds.

6. Stop the api, web, and db services via `ctrl+c` or `dev down` or if you want to wipe the database `dev down -v`.

### API Service (a.k.a back-end)

1. Boot only the api service using:

   ```bash
   dev up api

   # or

   docker compose -f docker-compose.development.yml up api

   # or

   npm run start # from the /api directory
   ```

2. Access the api by logging in to the front-end, then going to http://localhost:3000

### Web Service (a.k.a. front-end)

1. Boot only the web service using:

   ```bash
   dev up web

   # or

   docker compose -f docker-compose.development.yml up web

   # or

   npm run start # from the /web directory
   ```

2. Log in to the front-end service at http://localhost:8080

### DB Service (a.k.a database service)

1. Boot only the db service using:

   ```bash
   dev up db

   # or

   docker compose -f docker-compose.development.yml up db
   ```

   > Migrations run automatically, as do seeds.
   > NOTE: production and development have different seeds.

2. You can access the `sqlcmd` command line via

   ```bash
   dev sqlcmd

   # or

   docker compose -f docker-compose.development.yml exec db sh -c '
      /opt/mssql-tools/bin/sqlcmd
      -U "$DB_USER"
      -P "$DB_PASS"
      -H "$DB_HOST"
      -d "$DB_NAME"
      -I
   '
   ```

You can also skip seeding if database is not empty by setting the `SKIP_SEEDING_UNLESS_EMPTY=true` environment variable.

### Troubleshooting

If you are getting a bunch of "Login required" errors in the console, make sure that you have disabled any kind of enhanced tracking protection.

Auth0 use third-party cookies for authentication, and they get blocked by all major browsers
by default.

## Testing

1. Run the api test suite via `dev test_api`.

See [api/tests/README.md](./api/tests/README.md) for more detailed info.

## Migrations - Database Management

This project is using [umzug](https://github.com/sequelize/umzug) instead of [sequelize-cli](https://github.com/sequelize/cli) because `sequelize-cli` doesn't have TypeScript support.

NOTE: while database table names use snake_case, sequelize models use camelCase to match the JS standard. This means that migrations need to either provide a "field" name for each column that is snake_case, or use snake_case for the column names.

1. To create a new migration from the template [sample-migration](./api/src/db/template/sample-migration.ts) do:

   ```bash
   dev migrate create -- --name create-users-table.ts

   # Or

   dev sh
   npm run migrate create --name create-users-table.ts
   ```

   > If you are using Linux, all files created in docker will be created as `root` so you won't be able to edit them. Luckily, this is handle by the `dev migrate` command, when using Linux, after you provide your `sudo` password.

2. To run the all new migrations do:

   ```bash
   dev migrate up
   ```

3. To rollback the last executed migration:

   ```bash
   dev migrate down
   ```

4. To rollback all migrations:

   ```bash
   dev migrate down -- --to 0
   ```

### Seeding

Seeding is effectively the same as migrating, you just replace the `dev migrate` command with `dev seed`.

e.g.

- `dev seed create -- --name fill-users-table.ts`

Seeds are separated by environment.
i.e. api/src/db/seeds/development vs. api/src/db/seeds/production

This allows for the convenient loading of required defaults in production, with more complex seeds in development, for easy QA.

Seed code should be idempotent, so that it can be executed at any point in every environment.

Seeds currently don't keep track of whether they have run or not. An alternative to this would be to store seeds in a `SequelizeData` table. via `new SequelizeStorage({ sequelize, tablename: "SequelizeData" })` in the umzug seeder config.

### References

- [umzug](https://github.com/sequelize/umzug)
- [query-interface](https://sequelize.org/docs/v6/other-topics/query-interface/) migration examples.
- [query interface api](https://sequelize.org/api/v6/class/src/dialects/abstract/query-interface.js~queryinterface) for full details.

### Extras

If you want to take over a directory or file in Linux you can use `dev ownit <path-to-directory-or-file>`.

If you are on Windows or Mac, and you want that to work, you should implement it in the `bin/dev` file. You might never actually need to take ownership of anything, so this might not be relevant to you.

## Set up `dev` command

The `dev` command vastly simplifies development using docker compose. It only requires `ruby`; however, `direnv` and `asdf` will make it easier to use.

It's simply a wrapper around docker compose with the ability to quickly add custom helpers.

All commands are just strings joined together, so it's easy to add new commmands. `dev` prints out each command that it runs, so that you can run the command manually to debug it, or just so you learn some docker compose syntax as you go.

1. (optional) Install `asdf` as seen in https://asdf-vm.com/guide/getting-started.html.

   e.g. for Linux

   ```bash
   apt install curl git

   git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.12.0

   echo '
   # asdf
   . "$HOME/.asdf/asdf.sh"
   . "$HOME/.asdf/completions/asdf.bash"
   ' >> ~/.bashrc
   ```

2. Install `ruby` via `asdf` as seen here https://github.com/asdf-vm/asdf-ruby, or using whatever custom Ruby install method works for your platform.

   e.g. for Linux

   ```bash
   asdf plugin add ruby https://github.com/asdf-vm/asdf-ruby.git

   # install version from .tool-versions file
   asdf install ruby

   asdf reshim ruby
   ```

   You will now be able to run the `./bin/dev` command.

3. (optional) Install [direnv](https://direnv.net/) and create an `.envrc` with

   ```bash
    #!/usr/bin/env bash

    PATH_add bin
   ```

   and then run `direnv allow`.

   You will now be able to do `dev xxx` instead ov `./bin/dev xxx`.

# Deploying

## Production Environment (remote)

1. Create the appropriate database, as specified by the `DB_NAME` environment variable, and
2. Make sure the default `dbo` schema exists in that database.

## Test Production Build Locally

Files:

- [Dockerfile](./Dockerfile)
- [docker-compose.yml](./docker-compose.yml)
- Non-commited `.env` file

1. Create a `.env` file in top level directory with the appropriate values.

   ```bash
   NODE_ENV=production

   VITE_APPLICATION_NAME=Internal Data Portal
   VITE_AUTH0_DOMAIN=https://dev-0tc6bn14.eu.auth0.com
   VITE_AUTH0_CLIENT_ID=ZHjPOeCwYBov6eR1lxGOVYhYi4VPV8eU
   VITE_AUTH0_AUDIENCE=testing

   FRONTEND_URL=http://localhost:8080
   API_PORT=8080

   DB_HOST=db
   DB_PORT=1433
   DB_USER=sa
   DB_PASS=DevPwd99!
   DB_NAME=idp_production

   PRODUCTION_DATABASE_SA_MASTER_CREDS_AVAILABLE=true

   YUKON_GOVERNMENT_OCP_APIM_SUBSCRIPTION_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

2. (optional) If testing build arguments do

   ```bash
   dc build --build-arg RELEASE_TAG=2024.01.8.1 --build-arg GIT_COMMIT_HASH=532bd759c301ddc3352a1cee41ceac8061bfa3f7
   ```

   and then in the next step drop the `--build` flag.

3. Build and boot the production image via

   ```bash
   docker compose up --build
   ```

4. Go to http://localhost:8080/ and log in.

5. Navigate around the app and do some stuff and see if it works.
