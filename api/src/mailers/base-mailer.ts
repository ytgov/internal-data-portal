import { resolve } from "path"
import { readFileSync } from "fs"
import { template } from "lodash"

import nodemailer, { type Transporter } from "nodemailer"

import { MAIL_FROM, MAIL_HOST, MAIL_PORT } from "@/config"

type MethodNamesOf<T> = { [P in keyof T]: T[P] extends CallableFunction ? P : never }[keyof T]
type ArgumentTypes<T> = T extends (params: infer U) => unknown ? U : never

export type MailerOptions = {
  mailFrom?: string
  mailHost?: string
  mailPort?: number
}

export type SendMailOptions = {
  to: string
  subject: string
  html: string
  text?: string
}

export class BaseMailer {
  protected transporter: Transporter
  protected mailFrom: string
  protected mailHost: string
  protected mailPort: number

  constructor({
    mailFrom = MAIL_FROM,
    mailHost = MAIL_HOST,
    mailPort = MAIL_PORT,
  }: MailerOptions = {}) {
    this.mailFrom = mailFrom
    this.mailHost = mailHost
    this.mailPort = mailPort
    this.transporter = nodemailer.createTransport({
      host: mailHost,
      port: mailPort,
      secure: mailPort === 465, // Use `true` for port 465, `false` for all other ports
    })
  }

  static async deliverNow<T extends BaseMailer, M extends MethodNamesOf<T>>(
    this: new (mailerOptions?: MailerOptions) => T,
    method: M,
    params: ArgumentTypes<T[M]>,
    mailerOptions?: MailerOptions
  ) {
    const instance = new this(mailerOptions)
    return (instance[method] as CallableFunction)(params)
  }

  async sendMail({ to, subject, html, text }: SendMailOptions) {
    return this.transporter.sendMail({
      from: this.mailFrom,
      to,
      subject,
      html,
      text: text || html,
    })
  }

  renderHtml(name: string, data?: object | undefined) {
    return this.render(`${name}.html`, data)
  }

  renderText(name: string, data?: object | undefined) {
    return this.render(`${name}.txt`, data)
  }

  /**
   * TODO: add EJS or Pug for rendering, and add MJML for responsive emails
   */
  private render(name: string, data?: object | undefined) {
    const templatePath = this.templatePath(name)
    const templateString = readFileSync(templatePath, "utf8")
    const compiledTemplate = template(templateString)
    const body = compiledTemplate(data)
    return body
  }

  private templatePath(path: string) {
    return resolve(__dirname, `../templates`, path)
  }
}

export default BaseMailer
