"use client";

import { MyDataGrid } from "@/components/CustomComponents";
import { GridRowsProp } from "@mui/x-data-grid";
import { GridEventListener, GridRowModesModel } from "@mui/x-data-grid";
import { Dispatch, SetStateAction } from "react";
import { GridRowModel } from "@mui/x-data-grid";

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
    ) => void;
  }
}

export default function Maillocations(props: {
  apiRef?: any;
  rowsData: any[];
  cols: any[];
  rowModesModel: any;
  setRows: Dispatch<SetStateAction<any[]>>;
  setRowModesModel: Dispatch<SetStateAction<GridRowModesModel>>;
  handleRowModesModelChange?: (newRowModesModel: GridRowModesModel) => void;
  toolbar?: any;
  toolbarSlotProps?: Record<string, any>;
  handleRowEditStop?: GridEventListener<"rowEditStop">;
  handleProcessRowUpdate?: (newRow: GridRowModel) => Promise<any>;
  preProcessEditCellProps?: (params: any) => any;
  handlePagination?: (pagination: any) => void;
  rowCount?: any;
  paginationModel?: any;
  customFooter?: any;
  handleSortChange?: (sortMode: any) => void;
  sortModel?: any;
  sortingMode?: any;
  isRowSelectable?: any;
  getRowClassName?: any;
  onRowDoubleClick?: (params: any) => void;
}) {
  const setRows = props.setRows;
  const setRowModesModel = props.setRowModesModel;

  return (
    <MyDataGrid
      sortModel={props.sortModel}
      apiRef={props.apiRef}
      rows={props.rowsData}
      cols={props.cols}
      onSortModelChange={props.handleSortChange}
      onPaginationModelChange={props.handlePagination}
      onRowDoubleClick={props.onRowDoubleClick}
      initialState={{
        columns: {
          columnVisibilityModel: {
            id: false,
          },
        },
      }}
      paginationModel={props.paginationModel}
      pageSizeOptions={[15, 25, 50, 100]}
      editMode="row"
      rowModesModel={props.rowModesModel}
      onRowEditStop={props.handleRowEditStop}
      onRowModesModelChange={props.handleRowModesModelChange}
      slotProps={{
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        toolbar: { setRows: setRows as any, setRowModesModel, ...props.toolbarSlotProps },
      }}
      slots={{ toolbar: props.toolbar ?? null }}
      processRowUpdate={props.handleProcessRowUpdate}
      onProcessRowUpdateError={() => ""}
      rowCount={props.rowCount}
      paginationMode="client"
      sortingMode="client"
      checkboxSelection
      isRowSelectable={props.isRowSelectable}
      getRowClassName={props.getRowClassName}
    />
  );
}
