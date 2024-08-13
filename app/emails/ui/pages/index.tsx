import type { InferPageProps } from '@adonisjs/inertia/types'
import * as React from 'react'
import EmailsLayout from '#emails/ui/components/emails_layout'
import EmailsController from '#emails/controllers/emails_controller'
import { EmailsList } from '../components/emails_list'
import SearchEmails from '../components/search_emails'

const Emails: React.FunctionComponent<InferPageProps<EmailsController, 'index'>> = ({ emails }) => {
  return (
    <EmailsLayout topChildren={<p className="font-semibold text-lg">Inbox</p>}>
      <SearchEmails />
      <EmailsList items={emails} />
    </EmailsLayout>
  )
}

export default Emails
