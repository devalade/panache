export type DriveFile = {
    id: string
    name: string;
    mime: string;
    size: number;
    parent: DriveFile | null;
    files: DriveFile[];
    isFolder: boolean;
    createdAt: string;
}
