import * as React from 'react'
import DashboardLayout from '#common/ui/components/dashboard_layout'
import { DataTable } from '#drive/ui/components/data_table'
import { TopBarContent } from '#drive/ui/components/layouts/top_bar_content'
import { SidebarContent } from '#drive/ui/components/layouts/sidebar_content'
import { columns } from '#drive/ui/components/columns'
import { DriveFile } from '#drive/types/drive_file'
import useMessage from '#common/ui/hooks/use_message'
import { toast } from 'sonner'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '#common/ui/components/pagination'
import qs from 'qs'

interface Props {
  folders: DriveFile[]
  files: {
    data: DriveFile[]
    meta: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
      firstPage: number
      firstPageUrl: string
      lastPageUrl: string
      nextPageUrl: string | null
      previousPageUrl: string | null
    }
  }
}

const Drive: React.FunctionComponent<Props> = ({ files }) => {
  const [activeView, setActiveView] =
    React.useState<React.ComponentProps<typeof TopBarContent>['activeView']>('row-view')
  const message = useMessage<string>()

  React.useEffect(() => {
    if (message !== undefined) {
      toast.success(message)
    }
  }, [message])

  function onListViewSelect() {
    setActiveView('row-view')
  }

  function onGridViewSelect() {
    setActiveView('grid-view')
  }

  return (
    <DashboardLayout
      className="!p-0"
      moduleName="Drive"
      topChildren={
        <TopBarContent
          activeView={activeView}
          onGridViewSelect={onGridViewSelect}
          onListViewSelect={onListViewSelect}
        />
      }
      leftChildren={<SidebarContent />}
    >
      {activeView === 'row-view' && (
        <DataTable<DriveFile, any> columns={columns} data={files.data} />
      )}
      {files.meta.total > files.meta.perPage && (
        <Pagination className="mb-4">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href=""
                data={qs.parse(files.meta.previousPageUrl?.replace('/', '') ?? '')}
                preserveState
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href=""
                data={qs.parse(files.meta.nextPageUrl?.replace('/', '') ?? '')}
                preserveState
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </DashboardLayout>
  )
}

export default Drive
