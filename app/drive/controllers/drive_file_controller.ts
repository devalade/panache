import S3Service from '#drive/services/s3_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import DriveFile from '#drive/database/models/drive_files'
import logger from '@adonisjs/core/services/logger'
import { MultipartFile } from '@adonisjs/core/bodyparser'


export default class DriveFileController {
  @inject()
  async upload({ request, response, auth }: HttpContext, s3Service: S3Service) {
    const file = request.file('file')
    try {
      if(auth.user && file) {
        await this.createTree(file, auth.user?.id)
        await s3Service.uploadFile(auth.user?.id, file, file.clientName)
      }

      return response.created({
        message: "File uploaded successfully."
      })
    } catch (error) {
      logger.error({ error }, `An error occur when uploading the file ${auth.user?.id}`)
    }
  }

  async rename({ request, auth, inertia, session }: HttpContext) {
    const name = request.input('name')
    const id = request.param('id')

    // TODO: check if the name already exist
    const file = await DriveFile.find(id)
    if(file) {
      await file.merge({ name, updatedBy: auth.user?.id }).save()
    }
    session.flash('message','File renamed.')

    return inertia.location('/drive')
  }

  async trash({ request, inertia, session }: HttpContext) {
    const id = request.param('id')

    await DriveFile.query().where('id', id).update({ deletedAt: new Date() })


    session.flash('message', 'File deleted.')

    return inertia.location('/drive')
  }

  private async createTree(file: MultipartFile, userId: string) {
    const parts = file.clientName.split('/');
    let parentId = null;

    for (let i = 0; i < parts.length; i++) {
      const isLastPart = i === parts.length - 1;
      const isFolder = !isLastPart;
      const name = parts[i];

      const existingRecord = await DriveFile.query().where('name', name).orWhere('parentId', parentId ?? '').first();

      if (existingRecord) {
        parentId = existingRecord.id;
      } else {
        const newRecord: DriveFile = await DriveFile.create({
          name: name,
          mime: isFolder ? 'folder' : file.type,
          size: isFolder ? 0 : file.size,
          extname: isFolder ? null : file.extname,
          path: parts.slice(0, i + 1).join('/'),
          isFolder: isFolder,
          createdBy: userId,
          parentId: parentId,
        });

        parentId = newRecord.id;
      }
    }
  }

}
