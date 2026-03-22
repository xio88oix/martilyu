"use client";

import { MyDataGrid } from "@/components/CustomComponents";
import {
  GridEventListener,
  GridRowModel,
  GridRowModesModel,
  GridRowsProp,
} from "@mui/x-data-grid";
import { Dispatch, SetStateAction } from "react";

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel
    ) => void;
  }
}

interface ReferenceTrackingGridProps {
  rowsData: any[]; // TODO: improve typing — replace with a concrete row interface
  cols: any[]; // TODO: improve typing — replace with GridColDef[]
  rowModesModel: any;
  setRows: Dispatch<SetStateAction<any[]>>;
  setRowModesModel: Dispatch<SetStateAction<GridRowModesModel>>;
  handleRowModesModelChange?: (newRowModesModel: GridRowModesModel) => void;
  toolbar?: any; // TODO: improve typing — replace with React.ComponentType
  handleRowEditStop?: GridEventListener<"rowEditStop">;
  handleProcessRowUpdate?: (newRow: GridRowModel) => Promise<any>;
  preProcessEditCellProps?: (params: any) => any; // TODO: improve typing — replace with GridPreProcessEditCellProps
}

export default function ReferenceTrackingGrid(
  props: ReferenceTrackingGridProps
) {
  const setRows = props.setRows;
  const setRowModesModel = props.setRowModesModel;

  return (
    <>
      <MyDataGrid
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
        onProcessRowUpdateError={(e) => ""}
        getRowId={(row) => row.objid}
      />
    </>
  );
}
