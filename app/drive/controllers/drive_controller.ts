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

  async folder({ params, inertia, auth }: HttpContext) {
    let files: DriveFile[] = []
    if(params['*'].length > 0 && auth.user) {
        const [folderId] = params['*'];
        files = await DriveFile.notInTrash(auth.user.id)
                            .where('parentId', folderId)
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
