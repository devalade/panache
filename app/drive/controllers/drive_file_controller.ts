import S3Service from '#drive/services/s3_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import DriveFile from '#drive/database/models/drive_files'
import DriveFileService from '#drive/services/drive_file_service'
import queue from '@rlanz/bull-queue/services/main';
import DriveFileConsumer from '#drive/jobs/drive_file_consumer'


export default class DriveFileController {
    @inject()
    async upload({ request, response, auth }: HttpContext, s3Service: S3Service, driveFileService: DriveFileService) {
        const files = request.files('file')

        if (!files) {
            return response.badRequest('No files uploaded');
        }

        for (let file of files) {
            if (auth.user && file) {
                await s3Service.uploadFile(auth.user?.id, file, file.clientName)
            }
        }
        const fileStructures = driveFileService.prepareFileStructure(files, auth.user!.id)
        await driveFileService.insertFileStructure(fileStructures)

        return response.created({ message: "File uploaded successfully." })

    }

    async rename({ request, auth, inertia, session }: HttpContext) {
        const name = request.input('name')
        const id = request.param('id')

        // TODO: check if the name already exist
        const file = await DriveFile.find(id)
        if (file) {
            await file.merge({ name, updatedBy: auth.user?.id }).save()
        }
        session.flash('message', 'File renamed.')

        return inertia.location('/drive')
    }

    async trash({ request, inertia, session }: HttpContext) {
        const id = request.param('id')

        await DriveFile.query().where('id', id).update({ deletedAt: new Date() })

        session.flash('message', 'File deleted.')

        return inertia.location('/drive')
    }


}
