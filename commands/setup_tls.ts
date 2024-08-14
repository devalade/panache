import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import fs from 'node:fs/promises'

const execAsync = promisify(exec)

export default class SetupTLS extends BaseCommand {
  static commandName = 'setup:tls'
  static description = 'Set up TLS for SMTP server'

  static options: CommandOptions = {}

  async run() {
    this.logger.info('Setting up TLS for SMTP server...')

    try {
      // Generate TLS private key and certificate
      await execAsync(
        'openssl req -x509 -newkey rsa:4096 -keyout smtp-private-key.pem -out smtp-cert.pem -days 365 -nodes -subj "/CN=localhost"'
      )

      // Read the generated files
      const privateKey = await fs.readFile('smtp-private-key.pem', 'utf-8')
      const certificate = await fs.readFile('smtp-cert.pem', 'utf-8')

      // Update .env file
      let envContent = await fs.readFile('.env', 'utf-8')
      envContent = envContent.replace(
        /SMTP_KEY=.*/,
        `SMTP_KEY="${privateKey.replace(/\n/g, '\\n')}"`
      )
      envContent = envContent.replace(
        /SMTP_CERT=.*/,
        `SMTP_CERT="${certificate.replace(/\n/g, '\\n')}"`
      )
      await fs.writeFile('.env', envContent)

      // Clean up files
      await fs.unlink('smtp-private-key.pem')
      await fs.unlink('smtp-cert.pem')

      this.logger.success(
        'TLS set up successfully. Private key and certificate stored in environment variables.'
      )
    } catch (error) {
      this.logger.error('Failed to set up TLS.')
      this.logger.error(error)
    }
  }
}
