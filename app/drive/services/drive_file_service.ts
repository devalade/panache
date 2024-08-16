import DriveFile from "#drive/database/models/drive_files";
import { inject } from "@adonisjs/core";
import { MultipartFile } from "@adonisjs/core/bodyparser";

type FileStructure = { name: string; parent: string | null; mime: string | null; size: number | null; extname: string | null; path: string; isFolder: boolean; createdBy: string }

@inject()
export default class DriveFileService {
     prepareFileStructure(files: MultipartFile[], createdBy: string): Map<string, FileStructure[]> {
        const fileStructure: Map<string, FileStructure[]> = new Map();
        for (let index = 0; index < files.length; index++) {
            const file = files[index];
            const parts = file.clientName.split('/');
            /**
             * File upload to the root of the folder
             */
            if(parts.length == 1 ) {
                const olderRootFile =  fileStructure.has('/') ?  fileStructure.get('/') : [];
                fileStructure.set('/', (olderRootFile ?? []).concat([{ name: file.clientName, parent: null, mime: file.type!, size: 0, extname: file.extname!, path: file.clientName, isFolder: false, createdBy  }]))
            } else if(parts.length > 1) {
                for (let index = 0; index < parts.length; index++) {
                    const part = parts[index];
                    /**
                     * Folder
                     */
                    if(index === 0) {
                        fileStructure.set('/', [{ name: part, parent: null, mime: 'folder', size: null, extname: null, path: part, isFolder: true, createdBy  }])
                    }
                    /**
                     * SubFolder in the folder
                     */
                    else if(index !== 0 && index !== (parts.length -1)) {
                        const parentIndex= index-1;
                        const parentName = parts[parentIndex];
                        fileStructure.set(parts[index-1], [{ name: part, parent: parentName, mime: file.type!, size: file.size, extname: null, path: part, isFolder: false, createdBy  }])
                    }
                    /**
                     * Files
                     */
                    else if(index === (parts.length - 1)) {
                        const parentIndex= index-1;
                        const parentName = parts[parentIndex];
                        const olderRootFile =   fileStructure.get(parts[index-1]);
                        fileStructure.set(parts[index-1], (olderRootFile ?? []).concat([{ name: part, parent: parentName, mime: file.type!, size: file.size, extname: file.extname!, path: part, isFolder: false, createdBy }]))
                    }
                }
            }

        }

        return fileStructure;
    }

     async insertFileStructure(fileStructure: Map<string, FileStructure[]>) {
        const arrayOfFileStructure = Array.from(fileStructure);

        for (let index = 0; index < arrayOfFileStructure.length; index++) {
            const [key, items] = arrayOfFileStructure[index];
            if(key === '/') {
                await DriveFile.createMany(items as DriveFile[])
            } else {
                const parent = await DriveFile.firstOrCreate({ name: key }, { name: key, mime: 'folder', isFolder: true })
                await DriveFile.createMany(items.map(i => ({
                    ...i, parentId: parent.id
                })) as DriveFile[])
            }
        }
    }
}
