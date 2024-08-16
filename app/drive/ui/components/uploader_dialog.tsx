import React from 'react'
import { useToggle } from '#common/ui/hooks/use_toggle'
import { useFileUpload } from '#drive/hooks/use_file_upload'
import { router } from '@inertiajs/react'
import { formatBytes } from '#common/ui/lib/format_bytes'
import { Dialog, DialogContent, DialogTrigger } from '#common/ui/components/dialog'
import { Button } from '#common/ui/components/button'
import { FolderIcon, PaperclipIcon } from 'lucide-react'
import { MimeFileIcon } from './mime_file_icon'

type Props = {
  isOpen: boolean
  onToggle: () => void
}
export function UploaderDialog({ children, isOpen, onToggle }: React.PropsWithChildren<Props>) {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const folderInputRef = React.useRef<HTMLInputElement>(null)

  const [files, setFiles] = React.useState<File[] | null>([])
  const [fileStructure, setFileStructure] = React.useState<
    Array<{ name: string; mime: string; size: number; isFolder: boolean }>
  >([])
  const [errors, setErrors] = React.useState<any[]>([])
  const { uploadFile, uploadProgress } = useFileUpload('/drive/upload')

  const onFilesUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const _files = Array.from(event.target.files!) as File[]
    setFiles(_files)

    const _fileStructure = generateFileStructutre(_files)
    setFileStructure((prev) => [...fileStructure, ..._fileStructure])

    const uploadPromises = _fileStructure.map((f, i) => uploadFile(f.file, f.name))

    Promise.all(uploadPromises)
      .then(() => {
        router.reload({ only: ['files'] })
      })
      .catch(setErrors)
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const openFolderPicker = () => {
    folderInputRef.current?.click()
  }

  const onClose = () => {
    onToggle()
    setFiles([])
    setFileStructure([])
  }

  return (
    <Dialog open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        onInteractOutside={() => onClose()}
        hideCloseButton
        className=" flex flex-col h-3/6 aspect-video sm:max-w-xl md:max-w-2xl lg:max-w-3xl xl:max-w-5xl"
      >
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <span className="p-4 rounded-lg border border-border text-gray-600">
              <PaperclipIcon className="size-5" />
            </span>
            <div className="">
              <p className="font-semibold">Upload files</p>
              <p className="text-gray-500">Upload from your local computer</p>
            </div>
          </div>

          <label htmlFor="files">
            <span className="sr-only">Choose profile photo</span>
            <input
              ref={fileInputRef}
              onChange={onFilesUpload}
              name="files"
              type="file"
              className="hidden"
              multiple
            />
            <Button onClick={openFilePicker}>Upload files</Button>
          </label>
        </div>

        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <span className="p-4 rounded-lg border border-border text-gray-600">
              <PaperclipIcon className="size-5" />
            </span>
            <div className="">
              <p className="font-semibold">Upload folder</p>
              <p className="text-gray-500">Upload from your local computer</p>
            </div>
          </div>

          <label htmlFor="files">
            <span className="sr-only">Choose profile photo</span>
            <input
              ref={folderInputRef}
              onChange={onFilesUpload}
              name="files"
              type="file"
              className="hidden"
              webkitdirectory=""
              directory=""
              multiple
            />
            <Button onClick={openFolderPicker}>Upload folder</Button>
          </label>
        </div>

        {fileStructure && fileStructure.length > 0 ? (
          <ul className=" px-3 space-y-2 overflow-y-auto no-scrollbar">
            {fileStructure?.map((file, index) => (
              <li key={file.name} className="relative flex items-center p-2.5 rounded-md">
                <div
                  style={
                    {
                      '--progression': `${uploadProgress[file.name]}%`,
                    } as any
                  }
                  className="absolute inset-0 w-[--progression] bg-green-800/25 rounded-md"
                ></div>
                <span className="p-2">
                  {' '}
                  {file.isFolder ? <FolderIcon /> : <MimeFileIcon mimeType={file.mime} />}
                </span>{' '}
                {file.name} - {formatBytes(file.size)}
              </li>
            ))}
          </ul>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function generateFileStructutre(files: File[]) {
  const folderNames = new Map<
    string,
    { name: string; mime: string; size: number; isFolder: boolean; file: File | File[] }
  >()

  files.forEach((f) => {
    const rootFolder =
      f.webkitRelativePath.split('/').length > 1 ? f.webkitRelativePath.split('/')[0] : '/'
    const data: { name: string; mime: string; size: number; isFolder: boolean; file: File } = {
      name: rootFolder !== '/' ? rootFolder : f.name,
      mime: rootFolder !== '/' ? 'folder' : String(f.type),
      size: f.size,
      isFolder: rootFolder !== '/',
      file: f,
    }
    if (rootFolder !== '/') {
      const currentFolder = folderNames.has(rootFolder) ? folderNames.get(rootFolder) : data
      folderNames.set(rootFolder, {
        ...currentFolder,
        file: Array.isArray(currentFolder?.file)
          ? currentFolder?.file.concat(data.file)
          : [data.file],
        size: currentFolder!.size + data.size,
      } as any)
    } else {
      folderNames.set(f.name, data)
    }
  })

  return Array.from(folderNames, ([_, value]) => value)
}
