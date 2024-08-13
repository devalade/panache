import type { HttpContext } from '@adonisjs/core/http'
import DriveFile from '#drive/database/models/drive_files'

export default class DriveController {
  async index({ auth, inertia }: HttpContext) {
    let files: DriveFile[] = []
    if (auth.user) {
        files = await DriveFile.home(auth.user.id)
        .orderBy('createdAt', 'asc')
        .preload('files')
    }
    return inertia.render('drive/index', { files })
  }

  async search({ response, request, auth }: HttpContext) {
    const { search } = request.qs()
    let files: DriveFile[] = []
    if(auth.user && search) {
        files = await DriveFile.search(search, ['name'], auth.user.id)
    } else {
        files = await DriveFile.notInTrash(auth.user!.id)
    }
    return response.json({ data: files })
  }

  async folder({ request, inertia, auth }: HttpContext) {
    let files: DriveFile[] = []
    if(auth.user) {
        const folderId = request.param('id');
        files = await DriveFile.notInTrash(auth.user.id)
                            .where('parentId', folderId)
                            .limit(10)
                            .orderBy('createdAt', 'asc')
                            .preload('files')
    }
    return inertia.render('drive/index', { files })
  }

  async trash({ inertia, auth }: HttpContext) {
    let files: DriveFile[] = []
    if(auth.user) {
        files = await DriveFile.inTrash(auth.user.id)
                            .orderBy('createdAt', 'asc')
                            .preload('files')
    }
    return inertia.render('drive/index', { files })
  }
}
