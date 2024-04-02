import { resolve } from "path"
import { readFileSync } from "fs"
import { template } from "lodash"

import nodemailer, { type Transporter } from "nodemailer"

import { MAIL_FROM, MAIL_HOST, MAIL_PORT } from "@/config"

export type MailerOptions = {
  mailFrom?: string
  mailHost?: string
  mailPort?: number
}

export type SendMailOptions = {
  to: string
  subject: string
  text: string
  html: string
}

export class BaseMailer {
  protected transporter: Transporter
  protected mailFrom: string
  protected mailHost: string
  protected mailPort: number

  protected mailerName = "base_mailer"

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

  async sendMail({ to, subject, text, html }: SendMailOptions) {
    const info = await this.transporter.sendMail({
      from: this.mailFrom,
      to,
      subject,
      text,
      html,
    })
    return info
  }

  static async sendMail(options: SendMailOptions, mailerOptions?: MailerOptions) {
    const mailer = new BaseMailer(mailerOptions)
    return mailer.sendMail(options)
  }

  render(name: string, data?: object | undefined) {
    const templatePath = this.templatePath(`${name}.html`)
    const templateString = readFileSync(templatePath, "utf8")
    const compiledTemplate = template(templateString)
    const html = compiledTemplate(data)
    return html
  }

  protected templatePath(path: string) {
    return resolve(__dirname, `../templates/${this.mailerName}`, path)
  }
}

export default BaseMailer
