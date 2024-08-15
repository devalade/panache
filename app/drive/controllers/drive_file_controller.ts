import S3Service from '#drive/services/s3_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import DriveFile from '#drive/database/models/drive_files'
import { DRIVE_FILE, driveFileQueue } from '#drive/queues/drive_file_queue'
import DriveFileService from '#drive/services/drive_file_service'


export default class DriveFileController {
    @inject()
    async upload({ request, response, auth }: HttpContext, s3Service: S3Service, driveFileService: DriveFileService) {
        const files = request.files('file')

        driveFileQueue.add(DRIVE_FILE, {
            files
        })

        if (!files) {
            return response.badRequest('No files uploaded');
        }
        for (let file of files) {
            if (auth.user && file) {
                await s3Service.uploadFile(auth.user?.id, file, file.clientName)
            }
        }
        const fileStructures = driveFileService.prepareFileStructure(files)
        await driveFileService.insertFileStructure(fileStructures, auth.user!.id)

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
