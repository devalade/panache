import env from '#start/env'
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import crypto from 'node:crypto'
import fs from 'node:fs/promises'

export default class SetupDkim extends BaseCommand {
  static commandName = 'setup:dkim'
  static description = ''

  static options: CommandOptions = {}

  async run() {
    const { privateKey, publicKey } = generateDKIMKeyPair()
    const envFile = await fs.readFile('.env', 'utf-8')
    const updatedEnvFile = envFile
      .replace('<dkim_public_key>', publicKey)
      .replace('<dkim_private_key>', privateKey)
    await fs.writeFile('.env', updatedEnvFile)
    this.logger.success('DKIM key pair generated and saved to .env file')
  }
}

function generateDKIMKeyPair(keySize: number = 2048): {
  privateKey: string
  publicKey: string
} {
  // Generate the RSA key pair
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: keySize,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  })

  // Extract the public key in the correct format for DNS
  const dnsPublicKey = publicKey
    .toString()
    .replace(/-----BEGIN PUBLIC KEY-----/, '')
    .replace(/-----END PUBLIC KEY-----/, '')
    .replace(/\n/g, '')
    .trim()

  return {
    privateKey: privateKey.toString(),
    publicKey: dnsPublicKey,
  }
}
