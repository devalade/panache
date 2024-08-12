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
const FileController = () => import('#drive/controllers/file_controller')


router.group(() => {
    router.get('/drive', [DriveController, 'index'])
    router.get('/drive/folders/*', [DriveController, 'folders'])
    router.post('/drive/upload', [FileController, 'upload'])

    router.put('/drive/file/:id', [FileController, 'rename'])
    router.delete('/drive/file/:id', [FileController, 'trash'])


}).use(middleware.auth())
