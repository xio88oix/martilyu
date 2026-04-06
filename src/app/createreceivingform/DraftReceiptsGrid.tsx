"use client";

import { MyDataGrid } from "@/components/CustomComponents";
import {
  GridEventListener,
  GridRowModel,
  GridRowModesModel,
  GridRowsProp,
} from "@mui/x-data-grid";

declare module "@mui/x-data-grid" {
  interface ToolbarPropsOverrides {
    setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
    setRowModesModel: (
      newModel: (oldModel: GridRowModesModel) => GridRowModesModel
    ) => void;
  }
}

interface DraftReceiptsGridProps {
  rowsData: any[]; // TODO: improve typing — replace with a concrete row type once the data shape is defined
  cols: any[]; // TODO: improve typing — replace with GridColDef[] once column definitions are stabilised
  rowModesModel: any;
  // Functional-updater signature matches the ToolbarPropsOverrides augmentation above
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => void;
  handleRowModesModelChange?: (newRowModesModel: GridRowModesModel) => void;
  toolbar?: any;
  handleRowEditStop?: GridEventListener<"rowEditStop">;
  handleProcessRowUpdate?: (newRow: GridRowModel) => Promise<any>;
  preProcessEditCellProps?: (params: any) => any; // TODO: improve typing — params should be GridPreProcessEditCellProps
  onRowDoubleClick?: (params: any) => void;
}

export default function DraftReceiptsGrid(props: DraftReceiptsGridProps) {
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
