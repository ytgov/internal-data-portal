import BaseMailer from "@/mailers/base-mailer"

export class DatasetMailer extends BaseMailer {
  protected mailerName = "dataset_mailer"

  async emailSubscribers({
    to,
    subject,
    content,
  }: {
    to: string
    subject: string
    content: string
  }) {
    const html = this.render("email_subscribers", { content })

    return this.sendMail({ to, subject, text: html, html })
  }
}

export default DatasetMailer
