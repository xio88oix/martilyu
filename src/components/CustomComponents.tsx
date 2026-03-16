"use client";

import { DataGrid, DataGridProps, GridValidRowModel } from "@mui/x-data-grid";

type MyDataGridProps<R extends GridValidRowModel = any> = Omit<
  DataGridProps<R>,
  "columns"
> & {
  cols: DataGridProps<R>["columns"];
};

export function MyDataGrid<R extends GridValidRowModel = any>({
  cols,
  sx,
  ...rest
}: MyDataGridProps<R>) {
  return (
    <DataGrid<R>
      columns={cols}
      sx={{
        "& .col-header": {
          backgroundColor: "primary.main",
          color: "primary.contrastText",
          fontWeight: 600,
        },
        ...sx,
      }}
      {...rest}
    />
  );
}
