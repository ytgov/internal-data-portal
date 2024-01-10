import { stripTrailingSlash } from "@/utils/strip-trailing-slash"

export const environment = import.meta.env.MODE

// Generally we use window.location.origin for the redirect_uri but if
// you may want to use a different URL for the redirect_uri. Make sure you
// make the related changes in @/config.js and @/plugins/auth.js
export const APPLICATION_NAME = import.meta.env.VITE_APPLICATION_NAME || ""
export const APPLICATION_ICON = "mdi-cable-data"
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""

export const AUTH0_DOMAIN = stripTrailingSlash(import.meta.env.VITE_AUTH0_DOMAIN || "")
export const AUTH0_AUDIENCE = import.meta.env.VITE_AUTH0_AUDIENCE || ""
export const AUTH0_REDIRECT = import.meta.env.VITE_AUTH0_REDIRECT || ""
