import { belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import BaseModel from '#common/database/models/base_model'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import { DateTime } from 'luxon'

export default class DriveFile extends BaseModel {

    static notInTrash(userId: string){
        return this.query().whereNull('deletedAt').andWhere('createdBy', userId)
    }
    static inTrash(userId: string){
        return this.query().whereNotNull('deletedAt').andWhere('createdBy', userId)
    }

    static home(userId: string){
        return this.notInTrash(userId).andWhereNull('parentId')
    }

    static search(searchTerm: string, columns: string[], userId: string) {
        const columnString = columns.join(' || \' \' || ')

        return this.notInTrash(userId)
        .whereLike('name',`%${searchTerm}%`)

    }

    @column()
    declare name: string

    @column()
    declare path: string | null

    @column()
    declare parentId: string | null

    @belongsTo(() => DriveFile)
    declare parent: BelongsTo<typeof DriveFile> | null

    @hasMany(() => DriveFile, {
        foreignKey: 'parentId'
    })
    declare files: HasMany<typeof DriveFile>

    @column()
    declare isFolder: boolean

    @column()
    declare size: number | null

    @column()
    declare mime: string | null;

    @column()
    declare extname: string | null;

    @column()
    declare createdBy: string | null

    @column()
    declare updatedBy: string | null

    @column()
    declare deletedAt: DateTime | null

}
