import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

/** Maps column align to CSS logical text-align (works in RTL without branching). */
export function tableCellAlignSx(align) {
  if (!align || align === 'start' || align === 'left') {
    return { textAlign: 'start' };
  }
  if (align === 'end' || align === 'right') {
    return { textAlign: 'end' };
  }
  if (align === 'center') {
    return { textAlign: 'center' };
  }
  return { textAlign: 'start' };
}

/**
 * Unified data table for list pages (students, parents, users, …).
 *
 * @param {Array<{ id: string, label: string, align?: 'start'|'end'|'center'|'left'|'right', accessor?: string, render?: (row, rowIndex) => React.ReactNode, headerSx?: object, cellSx?: object }>} columns
 * @param {Array} rows
 * @param {(row: object, index: number) => string|number} [getRowId]
 * @param {string} [emptyMessage]
 * @param {React.ReactNode} [emptySlot] — replaces default empty state when rows.length === 0
 * @param {boolean} [dense]
 */
const AppDataTable = ({
  columns,
  rows,
  getRowId,
  emptyMessage = 'No data',
  emptySlot,
  dense = true,
}) => {
  if (!rows.length) {
    if (emptySlot) return emptySlot;
    return (
      <Paper
        variant="outlined"
        sx={{ p: 4, textAlign: 'center', bgcolor: 'background.paper', borderColor: 'divider' }}
      >
        <Typography color="text.secondary" variant="body2">
          {emptyMessage}
        </Typography>
      </Paper>
    );
  }

  return (
      <Paper
        variant="outlined"
        sx={{
          overflow: 'auto',
          bgcolor: 'background.paper',
          borderColor: 'divider',
        }}
      >
      <Table size={dense ? 'small' : 'medium'}>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                sx={{
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  ...tableCellAlignSx(col.align),
                  ...(col.headerSx || {}),
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, rowIndex) => (
            <TableRow
              key={getRowId ? getRowId(row, rowIndex) : rowIndex}
              hover
            >
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  sx={{
                    ...tableCellAlignSx(col.align),
                    verticalAlign: 'middle',
                    ...(col.cellSx || {}),
                  }}
                >
                  {col.render
                    ? col.render(row, rowIndex)
                    : row[col.accessor ?? col.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default AppDataTable;
