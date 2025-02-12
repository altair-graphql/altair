import React, { useState } from 'react';
import './table-list.css';
import {
  ColumnResizeDirection,
  ColumnResizeMode,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { TableDetails } from '../table-details/table-details';
import { formatSize, formatTime } from '../../helpers/format';
import clsx from 'clsx';
import { GraphQLRequest } from '../../types';

const columnHelper = createColumnHelper<GraphQLRequest>();

const defaultColumns = [
  columnHelper.accessor('name', {
    header: 'Request',
    cell: (info) => info.getValue(),
    // footer: info => info.column.id,
  }),
  columnHelper.accessor('queryType', {
    header: () => 'Type',
    cell: (info) => (
      <span
        className={clsx({
          'query-type-mutation': info.getValue() === 'mutation',
          'query-type-query': info.getValue() === 'query',
        })}
      >
        {info.getValue()}
      </span>
    ),
    // footer: info => info.column.id,
  }),
  columnHelper.accessor('method', {
    header: () => 'Method',
    cell: (info) => <i>{info.getValue()}</i>,
    // footer: info => info.column.id,
  }),
  columnHelper.accessor('status', {
    header: () => 'Status',
    cell: (info) => info.renderValue(),
    // footer: info => info.column.id,
  }),
  columnHelper.accessor('contentType', {
    header: () => 'Content Type',
    // footer: info => info.column.id,
  }),
  columnHelper.accessor('size', {
    header: 'Size',
    cell: (info) => formatSize(info.getValue()),
    // footer: info => info.column.id,
  }),
  columnHelper.accessor('time', {
    header: 'Time',
    cell: (info) => formatTime(info.getValue()),
    // footer: info => info.column.id,
  }),
  columnHelper.accessor('url', {
    header: 'URL',
    cell: (info) => info.getValue(),
    // footer: info => info.column.id,
  }),
];

interface TableListProps {
  requests: GraphQLRequest[];
}
export const TableList: React.FC<TableListProps> = ({ requests }) => {
  // const [data] = React.useState(() => [...requests]);
  const [selectedRequest, selectRequest] = useState<GraphQLRequest>();

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columns] = React.useState<typeof defaultColumns>(() => [...defaultColumns]);

  const [columnResizeMode, setColumnResizeMode] =
    useState<ColumnResizeMode>('onChange');

  const [columnResizeDirection, setColumnResizeDirection] =
    useState<ColumnResizeDirection>('ltr');

  const table = useReactTable({
    data: requests,
    columns,
    columnResizeMode,
    columnResizeDirection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), //client-side sorting
    onSortingChange: setSorting, //optionally control sorting
    state: {
      sorting,
    },
    debugAll: true,
  });

  return (
    <>
      <table className="table-list">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  {...{
                    key: header.id,
                    colSpan: header.colSpan,
                    style: {
                      width: header.getSize(),
                    },
                  }}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      onClick={header.column.getToggleSortingHandler()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          header.column.toggleSorting();
                        }
                      }}
                      title={
                        header.column.getCanSort()
                          ? header.column.getNextSortingOrder() === 'asc'
                            ? 'Sort ascending'
                            : header.column.getNextSortingOrder() === 'desc'
                              ? 'Sort descending'
                              : 'Clear sort'
                          : undefined
                      }
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                  <div
                    {...{
                      onDoubleClick: () => header.column.resetSize(),
                      onMouseDown: header.getResizeHandler(),
                      onTouchStart: header.getResizeHandler(),
                      className: `resizer ${table.options.columnResizeDirection} ${
                        header.column.getIsResizing() ? 'isResizing' : ''
                      }`,
                      style: {
                        transform:
                          columnResizeMode === 'onEnd' &&
                          header.column.getIsResizing()
                            ? `translateX(${
                                (table.options.columnResizeDirection === 'rtl'
                                  ? -1
                                  : 1) *
                                (table.getState().columnSizingInfo.deltaOffset ?? 0)
                              }px)`
                            : '',
                      },
                    }}
                  />
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} onClick={() => selectRequest(row.original)}>
              {row.getVisibleCells().map((cell) => (
                <td
                  {...{
                    key: cell.id,
                    style: {
                      width: cell.column.getSize(),
                    },
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <TableDetails
        request={selectedRequest}
        onClose={() => selectRequest(undefined)}
      />
    </>
  );
};
