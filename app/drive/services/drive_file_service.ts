import DriveFile from "#drive/database/models/drive_files";
import { inject } from "@adonisjs/core";

type FileStructure = { name: string; mime: string; size: number; extname: string; path: string; isFolder: boolean }

@inject()
export default class DriveFileService {
     prepareFileStructure(files: any[]): Array<FileStructure> {
        const fileStructure: Map<string, FileStructure> = new Map();

        files.forEach(file => {
            const parts = file.clientName.split('/');
            let currentPath = '';

            parts.forEach((part: string, index: number) => {
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

     async insertFileStructure(fileStructure: Array<FileStructure>, userId: string) {
        const parentIds: Map<string, string | null> = new Map();
        const foldersToInsert: Array<DriveFile> = [];
        const filesToInsert: Array<DriveFile> = [];

        // Separate folders and files for bulk insertion
        fileStructure.forEach(file => {
            const { name, mime, size, extname, path, isFolder } = file;
            const parentPath = path.substring(0, path.lastIndexOf('/'));
            const parentId = parentPath ? parentIds.get(parentPath) : null;

            const record: DriveFile = new DriveFile().fill({
                name,
                mime,
                size,
                extname,
                path,
                isFolder,
                createdBy: userId,
                parentId: parentId == undefined ? null : parentId,
            });

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
