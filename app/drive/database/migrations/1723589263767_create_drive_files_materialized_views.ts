import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'drive_files'

  async up() {
    this.schema.raw(`CREATE MATERIALIZED VIEW drive_file_unique_lexeme AS
   SELECT word FROM ts_stat('SELECT search FROM ${this.tableName}');`)
  }

  async down() {
    this.schema.raw(`
        DROP MATERIALIZED VIEW IF EXISTS drive_file_unique_lexeme;
      `);
  }
}
