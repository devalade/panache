import type { HttpContext } from '@adonisjs/core/http'
import File from '#drive/database/models/files'

export default class DriveController {
  async index({ auth, inertia }: HttpContext) {
    let files: File[] = []
    if (auth.user) {
        files = await File.home(auth.user.id)
        .orderBy('createdAt', 'asc')
        .preload('files')
    }
    return inertia.render('drive/index', { files })
  }

  async folders({ params, inertia, auth }: HttpContext) {
    let files: File[] = []
    if(params['*'].length > 0 && auth.user) {
        const [folderId] = params['*'];
        files = await File.notInTrash(auth.user.id)
                            .where('parentId', folderId)
                            .orderBy('createdAt', 'asc')
                            .preload('files')
    }
    return inertia.render('drive/index', { files })
  }
}
