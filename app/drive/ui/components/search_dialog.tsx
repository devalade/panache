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
import useFetch from '#common/ui/hooks/use_fetch'
import { useDebounce } from '#common/ui/hooks/use_debounce'
import { MimeFileIcon } from './mime_file_icon'
import { CommandLoading } from 'cmdk'
import React from 'react'
import { DriveFile } from '#drive/types/drive_file'
import { Link } from '@inertiajs/react'

export function SearchDialog({ isOpen, onToggle }: { isOpen: boolean; onToggle: () => void }) {
  const [search, setSearch] = React.useState('')
  const debounceValue = useDebounce(search)
  const { data, error, loading } = useFetch<{ data: DriveFile[] }>(
    `/api/drive/file?search=${encodeURIComponent(debounceValue.trim())}`,
    {
      enabled: isOpen,
    }
  )

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
    <CommandDialog open={isOpen} onOpenChange={onToggle} shouldFilter={false}>
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
