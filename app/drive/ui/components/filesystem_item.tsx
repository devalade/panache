import React, { useState } from 'react'
import { ChevronRightIcon } from 'lucide-react'
import { DriveFile } from '#drive/types/drive_file'
import { MimeFileIcon } from '#drive/ui/components/mime_file_icon'
import { useToggle } from '#common/ui/hooks/use_toggle'

export function FilesystemItem({ file }: { file: DriveFile }) {
  const { value: isOpen, toggle } = useToggle()

  return (
    <li key={file.id}>
      <span className="flex items-center gap-1.5 py-1 line-clamp-1">
        {file.isFolder && (
          <button onClick={() => toggle()} className="p-1 -m-1">
            <ChevronRightIcon className={`size-4 text-gray-500 ${isOpen ? 'rotate-90' : ''}`} />
          </button>
        )}

        <MimeFileIcon
          mimeType={file.mime}
          className={`size-5 text-gray-600 shrink-0 ${file.isFolder ? '' : 'ml-5'} `}
        />
        <span className="truncate overflow-hidden">{file.name}</span>
      </span>

      {isOpen && (
        <ul className="pl-6">
          {file.files?.map((file) => <FilesystemItem file={file} key={file.id} />)}
        </ul>
      )}
    </li>
  )
}
