import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'files'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary()
      table.string('name', 1024)
      table.string('path', 1024).nullable()
      
      table.string('parent_id').references('id').inTable('files').nullable()
      
      table.boolean('is_folder')
      table.string('mime').nullable()
      table.integer('size').nullable()
      
      table.string('created_by').references('id').inTable('users')
      table.string('updated_by').references('id').inTable('users').nullable()
      
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()

      table.timestamp('deleted_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}