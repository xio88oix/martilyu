"use client";

import React, { Dispatch, SetStateAction } from "react";
import { MyDataGrid } from "@/components/CustomComponents";
import {
  GridRowsProp,
  GridEventListener,
  GridRowModesModel,
  GridRowModel,
  GridColDef,
} from "@mui/x-data-grid";

// Module augmentation: extend MUI toolbar slot props with custom setters
declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel
    ) => void;
  }
}

interface PreviousReceiptsGridProps {
  rowsData: GridRowModel[];
  cols: GridColDef[];
  rowModesModel: GridRowModesModel;
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: Dispatch<SetStateAction<GridRowModesModel>>;
  handleRowModesModelChange?: (newRowModesModel: GridRowModesModel) => void;
  toolbar?: React.JSXElementConstructor<unknown>;
  handleRowEditStop?: GridEventListener<"rowEditStop">;
  handleProcessRowUpdate?: (newRow: GridRowModel) => Promise<GridRowModel>;
  // TODO: improve typing — params shape depends on the specific column definition
  preProcessEditCellProps?: (params: unknown) => unknown;
  onRowDoubleClick?: (params: any) => void;
}

export default function PreviousReceiptsGrid(
  props: PreviousReceiptsGridProps
) {
  const setRows = props.setRows;
  const setRowModesModel = props.setRowModesModel;

  return (
    <>
      <MyDataGrid
        onRowDoubleClick={props.onRowDoubleClick}
        rows={props.rowsData}
        cols={props.cols}
        initialState={{
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
      />
    </>
  );
}
