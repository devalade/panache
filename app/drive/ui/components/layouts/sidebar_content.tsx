import React from 'react'
import { Button } from '#common/ui/components/button'
import { CogIcon, SearchIcon, TrashIcon, UploadIcon } from 'lucide-react'
import { FilesystemItem } from '../filesystem_item'
import usePageProps from '#common/ui/hooks/use_page_props'
import { DriveFile } from '#drive/types/drive_file'
import { Link } from '@inertiajs/react'

export function SidebarContent() {
  const { files } = usePageProps<{ files: DriveFile[] }>()
  const { value: open, toggle } = useToggle()
  return (
    <>
      <SearchDialog isOpen={open} onToggle={toggle} />
      <div className="h-full flex flex-col px-2 text-gray-500">
        <div>
          <Button size="sm" variant="outline" className="w-full justify-start gap-x-2 text-black">
            {' '}
            <UploadIcon className="w-4 h-4" /> Upload
          </Button>
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
        <div className="h-12 flex-1 border border-destructive-foreground">
          <ul className="space-y-1">
            {files.map((file) => (
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
import { Calculator, Calendar, CreditCard, Settings, Smile, User } from 'lucide-react'

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '#common/ui/components/command'
import { useToggle } from '#common/ui/hooks/use_toggle'
import useFetch from '#common/ui/hooks/use_fetch'
import { useDebounce } from '#common/ui/hooks/use_debounce'
import { MimeFileIcon } from '../mime_file_icon'
import { CommandLoading } from 'cmdk'

export function SearchDialog({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const [search, setSearch] = React.useState('')
  const debounceValue = useDebounce(search)
  const { data, error, loading } = useFetch<{ data: DriveFile[] }>(
    `/api/drive/file?search=${encodeURIComponent(debounceValue.trim())}`,
    {
      enabled: isOpen,
    }
  )

  console.log({ data })

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onToggle()
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return (
    <CommandDialog open={isOpen} onOpenChange={onToggle} shouldFilder={false}>
      <CommandInput
        value={search}
        onValueChange={setSearch}
        placeholder="Search a file or folder name..."
      />
      <CommandList>
        {debounceValue !== '' && data !== null && data.data.length === 0 && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}
        {loading && <CommandLoading>Loading…</CommandLoading>}
        {error && <small className="text-red-700">Error: {error.message}</small>}

        {data?.data.map((file) => (
          <CommandItem key={file.id} asChild>
            <Link
              href={file.isFolder ? `/drive/folder/${file.id}` : '#'}
              className="flex items-center"
            >
              <MimeFileIcon mimeType={file.mime} className="mr-2 h-4 w-4" />
              <span>{file.name}</span>
            </Link>
          </CommandItem>
        ))}
      </CommandList>
    </CommandDialog>
  )
}
