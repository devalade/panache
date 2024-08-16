import type { HttpContext } from '@adonisjs/core/http'
import DriveFile from '#drive/database/models/drive_files'

export default class DriveController {
    async index({ request, auth, inertia }: HttpContext) {
        const page = request.input('page', 1)
        const limit = request.input('limit', 20)

        const files = await DriveFile.home(auth.user.id)
        .orderBy('createdAt', 'asc')
        .paginate(page, limit)

        return inertia.render('drive/index', { files: files.toJSON() })
    }

    async search({ response, request, auth }: HttpContext) {
        const { search } = request.qs()
        let files: DriveFile[] = []
        if (auth.user && search) {
            files = await DriveFile.search(search, ['name'], auth.user.id)
        } else {
            files = await DriveFile.notInTrash(auth.user!.id)
        }
        return response.json({ data: files })
    }

    async folder({ request, inertia, auth }: HttpContext) {
        const page = request.input('page', 1)
        const limit = request.input('limit', 20)
        const folderId = request.param('id');
        const files = await DriveFile.notInTrash(auth.user.id)
            .where('parentId', folderId)
            .orderBy('createdAt', 'asc')
            .paginate(page, limit)

        return inertia.render('drive/index', { files: files.toJSON() })
    }

    async trash({ inertia, auth }: HttpContext) {
        let files: DriveFile[] = []
        if (auth.user) {
            files = await DriveFile.inTrash(auth.user.id)
                .orderBy('createdAt', 'asc')
                .preload('files')
        }
        return inertia.render('drive/index', { files })
    }
}
