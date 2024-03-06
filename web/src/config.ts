type Environments = "development" | "production"

type ConfigAttributes = {
  API_BASE_URL: string
  AUTH0_DOMAIN: string
  AUTH0_CLIENT_ID: string
  AUTH0_AUDIENCE: string
}

const CONFIGS: {
  [key in Environments]: ConfigAttributes
} = {
  development: {
    API_BASE_URL: "http://localhost:3000",
    AUTH0_DOMAIN: "https://dev-0tc6bn14.eu.auth0.com",
    AUTH0_CLIENT_ID: "ZHjPOeCwYBov6eR1lxGOVYhYi4VPV8eU",
    AUTH0_AUDIENCE: "testing",
  },
  // Make sure that it's still possible to build locally in production mode
  // even after this gets changed, whether via environment variables in
  // docker-compose.yml or some other method
  production: {
    API_BASE_URL: "",
    AUTH0_DOMAIN: "https://yukon.eu.auth0.com",
    AUTH0_CLIENT_ID: "kbp3mBBVji9nIJUvLbq13ypfWZnUbU5j",
    AUTH0_AUDIENCE: "generic-production",
  },
}

export const ENVIRONMENT = import.meta.env.MODE as Environments

if (!(ENVIRONMENT in CONFIGS)) {
  throw new Error(`Invalid environment: ${ENVIRONMENT}`)
}

const config: ConfigAttributes = CONFIGS[ENVIRONMENT]

export const APPLICATION_NAME = "Internal Data Portal"
export const { API_BASE_URL, AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_AUDIENCE } = config

export default config
