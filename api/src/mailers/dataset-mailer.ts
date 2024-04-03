import BaseMailer from "@/mailers/base-mailer"

type EmailSubscribersOptions = {
  to: string
  from: string
  subject: string
  body: string
}

export class DatasetMailer extends BaseMailer {
  async emailSubscribers({ to, from, subject, body }: EmailSubscribersOptions) {
    const templateName = "dataset-mailer/email-subscribers"
    const html = this.renderHtml(templateName, { from, subject, body })
    return this.sendMail({ to, subject, html })
  }
}

export default DatasetMailer
