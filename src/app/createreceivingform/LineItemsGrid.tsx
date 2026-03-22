"use client";

import { MyDataGrid } from "@/components/CustomComponents";
import {
  GridEventListener,
  GridRowModesModel,
  GridRowsProp,
  GridColDef,
  GridRowModel,
} from "@mui/x-data-grid";
import React, { Dispatch, SetStateAction } from "react";

// ---------------------------------------------------------------------------
// MUI X DataGrid toolbar slot augmentation
// ---------------------------------------------------------------------------

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel
    ) => void;
  }
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface LineItemsGridProps {
  rowsData: GridRowModel[];
  cols: GridColDef[];
  rowModesModel: GridRowModesModel;
  setRows: Dispatch<SetStateAction<GridRowModel[]>>;
  setRowModesModel: Dispatch<SetStateAction<GridRowModesModel>>;
  handleRowModesModelChange: (
    newRowModesModel: GridRowModesModel
  ) => void;
  toolbar?: React.JSXElementConstructor<unknown>; // TODO: improve typing — replace with concrete toolbar component type
  handleRowEditStop?: GridEventListener<"rowEditStop">;
  handleProcessRowUpdate?: (newRow: GridRowModel) => Promise<GridRowModel>;
  preProcessEditCellProps?: (params: unknown) => unknown; // TODO: improve typing — use GridPreProcessEditCellProps when applicable
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LineItemsGrid(props: LineItemsGridProps) {
  const setRows = props.setRows;
  const setRowModesModel = props.setRowModesModel;

  return (
    <>
      <MyDataGrid
        getRowId={(row) => row.line_id}
        checkboxSelection
        rows={props.rowsData}
        cols={props.cols}
        initialState={{
          // sorting: {
          //   sortModel: [{ field: "shortDescription", sort: "asc" }],
          // },
          pagination: {
            paginationModel: {
              pageSize: 5,
            },
          },
          columns: {
            columnVisibilityModel: {
              id: false,
            },
          },
        }}
        pageSizeOptions={[5, 10, 25, { value: -1, label: "All" }]}
        editMode="row"
        rowModesModel={props.rowModesModel}
        onRowEditStop={props.handleRowEditStop}
        onRowModesModelChange={props.handleRowModesModelChange}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
        slots={{ toolbar: props.toolbar ?? null }}
        onCellEditStop={(params, event) => {
          console.log("the param value is : ", params);
          console.log("the event value is ", event);
        }}
        processRowUpdate={props.handleProcessRowUpdate}
        onProcessRowUpdateError={(_e) => { /* no-op — errors silently suppressed per PDF source */ }}
      />
    </>
  );
}
