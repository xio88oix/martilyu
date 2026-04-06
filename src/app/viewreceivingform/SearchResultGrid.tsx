"use client";

import { MyDataGrid } from "@/components/CustomComponents";
import {
  GridEventListener,
  GridRowModel,
  GridRowModesModel,
  GridRowsProp,
} from "@mui/x-data-grid";

export default function SearchResultGrid(props: {
  rowsData: any[];
  cols: any[];
  rowModesModel: any;
  // Functional-updater signatures match the global ToolbarPropsOverrides augmentation
  setRows: (newRows: (oldRows: GridRowsProp) => GridRowsProp) => void;
  setRowModesModel: (
    newModel: (oldModel: GridRowModesModel) => GridRowModesModel,
  ) => void;
  handleRowModesModelChange?: (newRowModesModel: GridRowModesModel) => void;
  toolbar?: any;
  handleRowEditStop?: GridEventListener<"rowEditStop">;
  handleProcessRowUpdate?: (newRow: GridRowModel) => Promise<any>;
  preProcessEditCellProps?: (params: unknown) => any; // TODO: improve typing
  apiRef?: any;
  type?: string;
  numberType?: number;
}) {
  const setRows = props.setRows;
  const setRowModesModel = props.setRowModesModel;

  return (
    <>
      <MyDataGrid
        onRowDoubleClick={(rows) => {
          console.log("the rows object is: ", rows);
          window.open(
            `/createreceivingform?recId=${rows.row.id}&son=${rows.row.son}&poNumber=${rows.row.po ?? ""}&type=${props.type}`,
          );
        }}
        getRowId={(row) => (row.sonid ? row.sonid : row.id)}
        apiRef={props.apiRef}
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
        onProcessRowUpdateError={(e) => ""}
      />
    </>
  );
}
