import BaseMailer from "@/mailers/base-mailer"

type EmailSubscribersOptions = {
  to: string
  subject: string
  body: string
}

export class DatasetMailer extends BaseMailer {
  async emailSubscribers({ to, subject, body }: EmailSubscribersOptions) {
    const templateName = "dataset-mailer/email-subscribers"
    const html = this.renderHtml(templateName, { subject, body })
    return this.sendMail({ to, subject, html, text: body })
  }
}

export default DatasetMailer
