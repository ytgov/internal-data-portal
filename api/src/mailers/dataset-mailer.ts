import BaseMailer from "@/mailers/base-mailer"

type EmailSubscribersOptions = {
  to: string
  subject: string
  content: string
}

export class DatasetMailer extends BaseMailer {
  async emailSubscribers({ to, subject, content }: EmailSubscribersOptions) {
    const templateName = "dataset_mailer/email_subscribers"
    const html = this.renderHtml(templateName, { content })
    return this.sendMail({ to, subject, html })
  }
}

export default DatasetMailer
