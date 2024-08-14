import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'drive_files'

  async up() {
    this.schema.raw(`ALTER TABLE ${this.tableName} ADD search tsvector GENERATED ALWAYS AS
                        (setweight(to_tsvector('simple', name), 'A') || ' ' ||
                        to_tsvector('simple', mime) || ' ' ||
                        to_tsvector('simple', extname)
                        ) STORED;
                    CREATE INDEX idx_search ON ${this.tableName} USING GIN(search);
 `)
  }

  async down() {
    this.schema.raw(`
        ALTER TABLE ${this.tableName}
        DROP COLUMN search;
      `)
  }
}
