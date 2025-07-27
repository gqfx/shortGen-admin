import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons'
import { Table } from '@tanstack/react-table'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DataTablePaginationProps<TData> {
  table?: Table<TData>
  // 外部分页控制
  page?: number
  pageSize?: number
  total?: number
  onPageChange?: (page: number) => void
  onPageSizeChange?: (size: number) => void
  // 行选择状态
  selectedRowCount?: number
  totalRowCount?: number
}

export function DataTablePagination<TData>({
  table,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  selectedRowCount,
  totalRowCount,
}: DataTablePaginationProps<TData>) {
  // 如果提供了外部分页参数，使用外部控制
  const isExternalPagination = !!(page !== undefined && pageSize !== undefined && total !== undefined)
  
  const currentPage = isExternalPagination ? page! : (table?.getState().pagination.pageIndex ?? 0) + 1
  const currentPageSize = isExternalPagination ? pageSize! : table?.getState().pagination.pageSize ?? 10
  const totalPages = isExternalPagination ? Math.ceil(total! / pageSize!) : table?.getPageCount() ?? 1
  
  const selectedCount = selectedRowCount ?? table?.getFilteredSelectedRowModel().rows.length ?? 0
  const totalCount = totalRowCount ?? table?.getFilteredRowModel().rows.length ?? 0

  const canPreviousPage = isExternalPagination ? currentPage > 1 : table?.getCanPreviousPage()
  const canNextPage = isExternalPagination ? currentPage < totalPages : table?.getCanNextPage()

  const handlePageChange = (newPage: number) => {
    if (isExternalPagination && onPageChange) {
      onPageChange(newPage)
    } else {
      table?.setPageIndex(newPage - 1) // table uses 0-based index
    }
  }

  const handlePageSizeChange = (newSize: string) => {
    const size = Number(newSize)
    if (isExternalPagination && onPageSizeChange) {
      onPageSizeChange(size)
    } else {
      table?.setPageSize(size)
    }
  }

  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {selectedCount > 0 && (
          <span>
            {selectedCount} of {totalCount} row(s) selected.
          </span>
        )}
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${currentPageSize}`}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={currentPageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => handlePageChange(1)}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Go to first page</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!canNextPage}
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => handlePageChange(totalPages)}
            disabled={!canNextPage}
          >
            <span className="sr-only">Go to last page</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}