import nodemailer from 'nodemailer'
import dns from 'dns'
import { promisify } from 'util'
import Email from '#emails/database/models/email'
import OutgoingEmail from '#emails/events/outgoing_email'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

const resolveMx = promisify(dns.resolveMx)

export default class HandleOutgoingEmail {
  private transporter: nodemailer.Transporter | null = null
  private ports = [25, 587, 465, 2525] // Common SMTP ports to try

  async handle(payload: OutgoingEmail) {
    const email = new Email()
    email.from = payload.from
    email.to = payload.to
    email.subject = payload.parsedEmail.subject || ''
    email.text = payload.parsedEmail.text || ''
    email.html = payload.parsedEmail.html || ''
    email.folder = 'sent'
    email.userId = payload.sender.id

    try {
      const domain = email.to.split('@')[1]
      const mxRecords = await resolveMx(domain)

      if (mxRecords.length === 0) {
        throw new Error(`No MX records found for domain: ${domain}`)
      }

      // Sort MX records by priority (lower is better)
      mxRecords.sort((a, b) => a.priority - b.priority)

      for (const record of mxRecords) {
        try {
          await this.createTransporter(record.exchange)

          if (this.transporter === null) {
            throw new Error('Failed to create a transporter')
          }

          // Send the email
          await this.transporter.sendMail({
            from: email.from,
            to: email.to,
            subject: email.subject,
            text: email.text,
            html: email.html,
          })

          // If sending is successful, save the email to the database
          await email.save()

          logger.info('Outgoing email sent successfully', {
            emailId: email.id,
            mxServer: record.exchange,
          })
          return
        } catch (error) {
          logger.warn(`Failed to send email using MX server: ${record.exchange}`, { error })
        }
      }

      throw new Error(`Failed to send email to ${email.to} using any available MX servers`)
    } catch (error) {
      logger.error('Failed to send outgoing email', { error, emailData: email })
      // TODO: Handle the error (e.g., queue for retry, notify admin, etc.)
    }
  }

  private async createTransporter(host: string) {
    for (const port of this.ports) {
      try {
        const transporter = nodemailer.createTransport({
          host: host,
          port: port,
          secure: port === 465, // Use TLS for port 465, otherwise use STARTTLS
          dkim: {
            domainName: 'panache.so',
            keySelector: 'default',
            privateKey: env.get('DKIM_PRIVATE_KEY'),
          },
        } as nodemailer.TransportOptions)

        // Verify the connection
        await transporter.verify()

        logger.info(`Successfully connected to SMTP server ${host} on port ${port}`)
        this.transporter = transporter
        return
      } catch (error) {
        logger.warn(`Failed to connect to SMTP server ${host} on port ${port}`, { error })
      }
    }

    throw new Error(`Failed to connect to SMTP server ${host} on all attempted ports`)
  }
}
