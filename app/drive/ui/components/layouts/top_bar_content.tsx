import * as React from 'react'
import { Button } from '#common/ui/components/button'
import {
  ChevronDown,
  DownloadIcon,
  FolderPlusIcon,
  LayoutGrid,
  LinkIcon,
  ListIcon,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '#common/ui/components/dropdown_menu'
import { UploaderDialog } from '../uploader_dialog'
import { useToggle } from '#common/ui/hooks/use_toggle'

interface Props {
  onListViewSelect: () => void
  onGridViewSelect: () => void
  activeView: 'row-view' | 'grid-view'
}

export function TopBarContent(props: Props) {
  const { activeView, onGridViewSelect, onListViewSelect } = props
  const { value: isOpen, toggle: onToggle } = useToggle()

  return (
    <div className="w-full flex  items-center justify-between">
      <span>Drive</span>
      <div className="flex items-center gap-x-2 divi">
        <div className="flex items-center gap-x-2.5">
          <Button size="sm" variant="outline" aria-label="Download">
            <DownloadIcon className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" aria-label="Upload">
            <FolderPlusIcon className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline" aria-label="Upload">
            <LinkIcon className="w-4 h-4" />
          </Button>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline">
              {' '}
              <ChevronDown className="h-4 w-4" />{' '}
              {activeView === 'row-view' ? (
                <>
                  {' '}
                  <ListIcon className="w-4 h-4" />{' '}
                </>
              ) : (
                <>
                  {' '}
                  <LayoutGrid className="w-4 h-4" />{' '}
                </>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-32">
            <DropdownMenuItem onClick={() => onListViewSelect()}>
              <ListIcon className="w-4 h-4" /> <span className="sr-only">Listing view</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onGridViewSelect()}>
              <LayoutGrid className="w-4 h-4" /> <span className="sr-only">Listing view</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <UploaderDialog isOpen={isOpen} onToggle={onToggle}>
          <Button onClick={() => onToggle()} variant="outline" size="sm">
            Upload
          </Button>
        </UploaderDialog>
        <Button size="sm">Share</Button>
      </div>
    </div>
  )
}
