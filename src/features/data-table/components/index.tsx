"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTablePagination } from "@/features/data-table/components/table-pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onReorder?: (data: TData[]) => void;
  enablePagination?: boolean;
  enableColumnFilters?: boolean;
  enableFilters?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  enablePagination = true,
  enableColumnFilters = true,
  enableFilters = true,
}: DataTableProps<TData, TValue>) {
  const t = useTranslations("data_table");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: !enablePagination,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <>
      {(enablePagination || enableColumnFilters) && (
        <div className="flex flex-col items-end justify-end gap-2 py-4 md:flex-row md:items-center md:gap-12">
          {enablePagination && <DataTablePagination table={table} totalCount={data.length} />}
          {enableColumnFilters && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <SlidersHorizontal className="size-5" />
                  <span>{t("view")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                      >
                        {column.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
      <div className="bg-background mx-auto w-[90vw] overflow-x-scroll rounded-md border md:w-full">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {enableFilters && (
              <TableRow>
                {table.getVisibleFlatColumns().map((column) => (
                  <TableCell className="relative p-0" key={column.id}>
                    {column.id !== "actions" && (
                      <>
                        <Input
                          placeholder={t("filter_button")}
                          value={(table.getColumn(column.id)?.getFilterValue() as string) ?? ""}
                          onChange={(event) =>
                            table.getColumn(column.id)?.setFilterValue(event.target.value)
                          }
                          className="h-full w-full rounded-none border-0 ring-0 outline-0 placeholder:text-xs focus-visible:ring-0 md:pl-7"
                        />
                        <Search className="absolute top-2.5 left-1 hidden size-4 md:inline-block" />
                      </>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            )}
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="text-muted-foreground text-center font-mono text-sm select-none">
                    {t("no_results")}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
