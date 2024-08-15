import S3Service from '#drive/services/s3_service'
import { inject } from '@adonisjs/core'
import type { HttpContext } from '@adonisjs/core/http'
import DriveFile from '#drive/database/models/drive_files'
import logger from '@adonisjs/core/services/logger'
import { MultipartFile } from '@adonisjs/core/bodyparser'


export default class DriveFileController {
    @inject()
    async upload({ request, response, auth }: HttpContext, s3Service: S3Service) {
        const files = request.files('file')
        if (!files) {
            return response.badRequest('No files uploaded');
        }
        for (let file of files) {
            if (auth.user && file) {
                await s3Service.uploadFile(auth.user?.id, file, file.clientName)
            }
        }
        const fileStructures = this.prepareFileStructure(files)
        await this.insertFileStructure(fileStructures, auth.user!.id)

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

   private prepareFileStructure(files: any[]): Array<{ name: string; mime: string; size: number; extname: string; path: string; isFolder: boolean }> {
    const fileStructure: Map<string, { name: string; mime: string; size: number; extname: string; path: string; isFolder: boolean }> = new Map();

    files.forEach(file => {
        const parts = file.clientName.split('/');
        let currentPath = '';

        parts.forEach((part, index) => {
            const isFolder = index < parts.length - 1;
            currentPath = currentPath ? `${currentPath}/${part}` : part;

            if (!fileStructure.has(currentPath)) {
                fileStructure.set(currentPath, {
                    name: part,
                    mime: isFolder ? 'folder' : file.type,
                    size: isFolder ? 0 : file.size,
                    extname: isFolder ? null : file.extname,
                    path: currentPath,
                    isFolder,
                });
            }
        });
    });

    return Array.from(fileStructure.values());
}

private async insertFileStructure(fileStructure: Array<{ name: string; mime: string; size: number; extname: string; path: string; isFolder: boolean }>, userId: string) {
    const parentIds: Map<string, string | null> = new Map();
    const foldersToInsert: Array<DriveFile> = [];
    const filesToInsert: Array<DriveFile> = [];

    // Separate folders and files for bulk insertion
    fileStructure.forEach(file => {
        const { name, mime, size, extname, path, isFolder } = file;
        const parentPath = path.substring(0, path.lastIndexOf('/'));
        const parentId = parentPath ? parentIds.get(parentPath) : null;

        const record: DriveFile = {
            name,
            mime,
            size,
            extname,
            path,
            isFolder,
            createdBy: userId,
            parentId: parentId == undefined ? null : parentId,
        };

        if (isFolder) {
            foldersToInsert.push(record);
        } else {
            filesToInsert.push(record);
        }
    });

    // Insert folders and update parentIds
    const insertedFolders = await DriveFile.createMany(foldersToInsert);
    insertedFolders.forEach(record => parentIds.set(record.path!, record.id));

    // Update parent IDs for files and insert them
    filesToInsert.forEach(file => {
        const parentPath = file.path!.substring(0, file.path!.lastIndexOf('/'));
        file.parentId = parentPath ? parentIds.get(parentPath) ?? null : null;
    });

    await DriveFile.createMany(filesToInsert);
}

}
