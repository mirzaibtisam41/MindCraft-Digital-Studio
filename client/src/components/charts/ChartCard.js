'use client';

import { useState } from 'react';
import { BarChart3, Table2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

function LegendKey({ color, shape }) {
  return shape === 'line' ? (
    <span
      className="h-0.5 w-3.5 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  ) : (
    <span
      className="size-2.5 rounded-[3px]"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}

export function ChartLegend({ items }) {
  if (!items || items.length < 2) return null;

  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {items.map((item) => (
        <li
          key={item.label}
          className="flex items-center gap-1.5 text-[12px] text-muted-foreground"
        >
          <LegendKey color={item.color} shape={item.shape} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

function ChartTable({ table }) {
  return (
    <div className="max-h-72 overflow-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {table.columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn(column.numeric && 'text-right')}
              >
                {column.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {table.rows.map((row, index) => (
            <TableRow key={index}>
              {table.columns.map((column) => (
                <TableCell
                  key={column.key}
                  className={cn(
                    column.numeric && 'text-right font-mono tabular-nums',
                  )}
                >
                  {column.format
                    ? column.format(row[column.key])
                    : row[column.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function ChartCard({
  title,
  description,
  legend,
  table,
  className,
  children,
}) {
  const [showTable, setShowTable] = useState(false);

  return (
    <section
      className={cn(
        'flex flex-col gap-4 rounded-xl border bg-card p-5',
        className,
      )}
      aria-label={title}
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[14.5px] font-semibold">{title}</h2>
          {description ? (
            <p className="text-[12.5px] text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {table ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowTable((value) => !value)}
            aria-pressed={showTable}
            className="text-muted-foreground"
          >
            {showTable ? (
              <BarChart3 className="size-3.5" />
            ) : (
              <Table2 className="size-3.5" />
            )}
            {showTable ? 'Chart' : 'Table'}
          </Button>
        ) : null}
      </header>
      {showTable && table ? (
        <ChartTable table={table} />
      ) : (
        <>
          <ChartLegend items={legend} />
          {children}
        </>
      )}
    </section>
  );
}
