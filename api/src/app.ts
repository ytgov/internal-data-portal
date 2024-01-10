import express, { type Request, type Response } from "express"
import cors from "cors"
import path from "path"
import helmet from "helmet"

import { VUE_APP_FRONTEND_URL } from "@/config"
import router from "@/router"

export const app = express()
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "default-src": ["'self'", "https://dev-0tc6bn14.eu.auth0.com"],
      "base-uri": ["'self'"],
      "block-all-mixed-content": [],
      "font-src": ["'self'", "https:", "data:"],
      "frame-ancestors": ["'self'"],
      "img-src": ["'self'", "data:", "https:"],
      "object-src": ["'none'"],
      "script-src": ["'self'", "'unsafe-eval'"],
      "script-src-attr": ["'none'"],
      "style-src": ["'self'", "https:", "'unsafe-inline'"],
      "worker-src": ["'self'", "blob:"],
      "connect-src": ["'self'", "https://dev-0tc6bn14.eu.auth0.com"],
    },
  })
)

// very basic CORS setup
app.use(
  cors({
    origin: VUE_APP_FRONTEND_URL,
    optionsSuccessStatus: 200,
    credentials: true,
  })
)

app.use(router)

// serves the static files generated by the front-end
app.use(express.static(path.join(__dirname, "web")))

// if no other routes match, just send the front-end
app.use((req: Request, res: Response) => {
  res.status(404).sendFile(path.join(__dirname, "web/index.html"))
})

export default app
