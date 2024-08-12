/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const DriveController = () => import('#drive/controllers/drive_controller')
const DriveFileController = () => import('#drive/controllers/drive_file_controller')


router.group(() => {
    router.get('/drive', [DriveController, 'index'])
    router.get('/drive/folder/*', [DriveController, 'folder'])
    router.get('/drive/trash', [DriveController, 'trash'])
    router.post('/drive/upload', [DriveFileController, 'upload'])


    router.put('/drive/file/:id', [DriveFileController, 'rename'])
    router.delete('/drive/file/:id', [DriveFileController, 'trash'])
}).use(middleware.auth())
