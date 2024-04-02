import BaseMailer, { type SendMailOptions } from "@/mailers/base-mailer"

export class DatasetMailer extends BaseMailer {
  protected mailerName = "dataset_mailer"

  async emailSubscribers(
    { to, subject }: Omit<SendMailOptions, "text" | "html">,
    data?: object | undefined
  ) {
    const html = this.render("email_subscribers", data)

    return this.sendMail({ to, subject, text: html, html })
  }
}

export default DatasetMailer
