import * as React from 'react'

interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  children: React.ReactNode;
  className?: string;
}

interface TableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
  className?: string;
}

interface TableBodyProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  children: React.ReactNode;
  className?: string;
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  className?: string;
}

interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  className?: string;
  colSpan?: number;
}

export const Table: React.FC<TableProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => (
  <table className={`w-full border-collapse ${className}`} {...props}>
    {children}
  </table>
);

export const TableHeader: React.FC<TableHeaderProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => (
  <thead className={className} {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<TableBodyProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => (
  <tbody className={className} {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<TableRowProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => (
  <tr className={`border-b transition-colors hover:bg-gray-50 ${className}`} {...props}>
    {children}
  </tr>
);

export const TableHead: React.FC<TableHeadProps> = ({ 
  children, 
  className = '', 
  colSpan,
  ...props 
}) => (
  <th 
    className={`p-4 text-left text-sm font-medium text-gray-500 ${className}`} 
    colSpan={colSpan}
    {...props}
  >
    {children}
  </th>
);

export const TableCell: React.FC<TableCellProps> = ({ 
  children, 
  className = '', 
  colSpan,
  ...props 
}) => (
  <td 
    className={`p-4 text-sm ${className}`} 
    colSpan={colSpan}
    {...props}
  >
    {children}
  </td>
);