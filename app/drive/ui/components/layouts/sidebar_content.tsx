import React from 'react'
import { Button } from '#common/ui/components/button'
import { CogIcon, SearchIcon, TrashIcon, UploadIcon } from 'lucide-react'
import { FilesystemItem } from '../filesystem_item'
import usePageProps from '#common/ui/hooks/use_page_props'
import { DriveFile } from '#drive/types/drive_file'
import { Link } from '@inertiajs/react'
import { useToggle } from '#common/ui/hooks/use_toggle'
import { SearchDialog } from '../search_dialog'
import { UploaderDialog } from '../uploader_dialog'

export function SidebarContent() {
  const { files } = usePageProps<{ files: { data: DriveFile[] } }>()
  const { value: open, toggle } = useToggle()
  const { value: isOpenUploaderDialog, toggle: onOpenUploaderDialog } = useToggle()
  return (
    <>
      <SearchDialog isOpen={open} onToggle={toggle} />
      <div className="h-full flex flex-col px-2 text-gray-500">
        <div>
          <UploaderDialog isOpen={isOpenUploaderDialog} onToggle={onOpenUploaderDialog}>
            <Button
              onClick={() => onOpenUploaderDialog()}
              size="sm"
              variant="outline"
              className="w-full justify-start gap-x-2 text-black"
            >
              {' '}
              <UploadIcon className="w-4 h-4" /> Upload
            </Button>
          </UploaderDialog>
          <Button
            onClick={() => toggle()}
            size="sm"
            variant="ghost"
            className="w-full justify-start gap-x-2"
          >
            {' '}
            <SearchIcon className="w-4 h-4" /> Search
          </Button>
          <Button size="sm" variant="ghost" className="w-full justify-start gap-x-2">
            {' '}
            <CogIcon className="w-4 h-4" /> Settings
          </Button>
        </div>
        <hr className="-mx-2.5 bg-destructive-foreground" />
        <div className="flex-1">
          <ul className="space-y-2 h-[calc(100vh_-_343px)] overflow-y-auto no-scrollbar">
            {files.data.map((file) => (
              <FilesystemItem file={file} key={file.id} />
            ))}
          </ul>
        </div>
        <hr className="-mx-2.5 bg-destructive-foreground" />
        <div className="py-2">
          <Button asChild size="sm" variant="ghost" className="w-full justify-start gap-x-2">
            <Link href="/drive/trash">
              {' '}
              <span className="p-1 bg-white rounded-full border">
                {' '}
                <TrashIcon className="w-4 h-4" />{' '}
              </span>{' '}
              TRASH
            </Link>
          </Button>
          <div className="text-gray-500 mt-2.5">
            <span className="inline-block bg-gray-200 rounded-full h-2 w-full">
              <span className="block bg-red-500  w-full"></span>
            </span>
            <div className="flex items-center justify-between text-sm">
              <span>0/10GB</span>
              <span>Upgrade</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
