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
    // Driver
    router.get('/drive', [DriveController, 'index'])
    router.get('/drive/folder/:id', [DriveController, 'folder'])
            .where('id', router.matchers.uuid())
    router.get('/drive/trash', [DriveController, 'trash'])
    router.post('/drive/upload', [DriveFileController, 'upload'])
    // Driver API
    router.get('/api/drive/file', [DriveController, 'search'])

    router.put('/drive/file/:id', [DriveFileController, 'rename'])
        .where('id', router.matchers.uuid())
    router.delete('/drive/file/:id', [DriveFileController, 'trash'])
        .where('id', router.matchers.uuid())
}).use(middleware.auth())
