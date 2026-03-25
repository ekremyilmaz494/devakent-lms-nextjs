'use client'

import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import type { RecentActivity } from '@/lib/mock-data'

interface RecentActivityTableProps {
  activities: RecentActivity[]
}

const statusVariants = {
  tamamlandı: { variant: 'default' as const, label: 'Tamamlandı' },
  'devam ediyor': { variant: 'secondary' as const, label: 'Devam Ediyor' },
  başarısız: { variant: 'secondary' as const, label: 'Başarısız' },
}

const columns: ColumnDef<RecentActivity>[] = [
  {
    accessorKey: 'staffName',
    header: 'Personel',
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue('staffName')}</div>
    ),
  },
  {
    accessorKey: 'trainingTitle',
    header: 'Eğitim',
    cell: ({ row }) => (
      <div className="max-w-md truncate">{row.getValue('trainingTitle')}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Durum',
    cell: ({ row }) => {
      const status = row.getValue('status') as keyof typeof statusVariants
      const config = statusVariants[status]
      return <Badge variant={config.variant}>{config.label}</Badge>
    },
  },
  {
    accessorKey: 'score',
    header: ({ column }) => {
      return (
        <button
          className="flex items-center gap-1 font-semibold hover:text-foreground"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Puan
          {column.getIsSorted() === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
          ) : column.getIsSorted() === 'desc' ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronsUpDown className="h-4 w-4" />
          )}
        </button>
      )
    },
    cell: ({ row }) => {
      const score = row.getValue('score') as number | null
      if (score === null) {
        return <span className="text-muted-foreground">-</span>
      }
      const color =
        score >= 85 ? 'text-success' : score >= 70 ? 'text-warning' : 'text-error'
      return <span className={`font-mono font-semibold ${color}`}>{score}</span>
    },
  },
  {
    accessorKey: 'date',
    header: 'Tarih',
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.getValue('date')}
      </div>
    ),
  },
]

export function RecentActivityTable({ activities }: RecentActivityTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])

  const table = useReactTable({
    data: activities,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  })

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full">
          <thead className="bg-muted/50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-semibold text-muted-foreground"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="transition-colors hover:bg-muted/30"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} aktiviteden{' '}
          {table.getState().pagination.pageIndex *
            table.getState().pagination.pageSize +
            1}
          -
          {Math.min(
            (table.getState().pagination.pageIndex + 1) *
              table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          arası gösteriliyor
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Önceki
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sonraki
          </button>
        </div>
      </div>
    </div>
  )
}
