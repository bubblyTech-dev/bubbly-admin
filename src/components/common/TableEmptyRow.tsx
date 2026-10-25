import { TableCell, TableRow } from '@mui/material';

interface TableEmptyRowProps {
  colSpan: number;
  message: string;
}

// The row shown when a list has nothing to show.
const TableEmptyRow = ({ colSpan, message }: TableEmptyRowProps) => {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} align="center" sx={{ py: 6, color: 'text.secondary' }}>
        {message}
      </TableCell>
    </TableRow>
  );
};

export default TableEmptyRow;
