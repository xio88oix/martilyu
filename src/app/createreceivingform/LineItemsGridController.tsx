"use client";

import { Add } from "@mui/icons-material";
import {
  GridRowModes,
  GridEventListener,
  GridRowEditStopReasons,
  GridRowId,
  GridRowModel,
  GridRowModesModel,
  GridColDef,
  GridToolbarContainer,
  GridRenderCellParams,
  useGridApiContext,
} from "@mui/x-data-grid";
import LineItemsGrid from "./LineItemsGrid";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  SnackbarCloseReason,
  TextField,
} from "@mui/material";
import BackdropLoader from "@/components/BackdropLoader";
import MySnackbar from "@/components/MySnackbar";
// NOTE: useFetchShippingRegions is referenced in the PDF but commented out at call-site.
// Stub retained here so the import resolves; replace once services.tsx exports this hook.
// import { useFetchShippingRegions } from "../ServiceHooks/services";


// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

interface LineItemRow {
  id: number;
  line_number?: string;
  partnum?: string;
  description?: string;
  ord_qty?: string;
  ord_uom?: string;
  rec_qty?: string;
  qty_due?: string;
  total_qty_received?: string;
  rec_uom?: string;
  rotating?: boolean | string;
  assetItems?: string;
  boxItems?: string;
  isNew?: boolean;
}

interface LineItemsGridControllerProps {
  data: LineItemRow[];
  active?: boolean;
}

// ---------------------------------------------------------------------------
// EditTextField — custom cell editor with focus management and max-length cap
// ---------------------------------------------------------------------------

interface EditTextFieldParentProps {
  props: GridRenderCellParams;
  limit: number;
}

function EditTextField(parentProp: EditTextFieldParentProps) {
  const { id, value, field, hasFocus } = parentProp.props;
  const apiRef = useGridApiContext();
  const ref = useRef<HTMLDivElement>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    apiRef.current.setEditCellValue({ id, field, value: event.target.value });
  };

  useEffect(() => {
    if (hasFocus && ref.current) {
      const input = ref.current.querySelector<HTMLInputElement>(
        `input[value="${value}"]`
      );
      input?.focus();
    }
  });

  return (
    <TextField
      ref={ref}
      placeholder="*Required"
      inputProps={{ maxLength: parentProp.limit }}
      // error={String(value).trim() === ""}
      value={value ?? ""}
      onChange={handleChange}
      className="body1"
      required
      sx={{
        width: "100%",
        "& .MuiInputBase-input": {
          fontSize: "1.6rem",
          color: "black",
        },
      }}
    />
  );
}

const renderEditTextField =
  (maxLength: number) =>
  (params: GridRenderCellParams) =>
    <EditTextField props={params} limit={maxLength} />;

// ---------------------------------------------------------------------------
// Column definitions
// ---------------------------------------------------------------------------

const cols: GridColDef[] = [
  { field: "id" },
  {
    field: "line_number",
    headerName: "Line #",
    flex: 1,
    headerClassName: "col-header",
    editable: true,
    renderEditCell: renderEditTextField(25),
  },
  {
    field: "partnum",
    headerName: "Part #",
    flex: 1,
    headerClassName: "col-header",
    editable: true,
    renderEditCell: renderEditTextField(255),
  },
  {
    field: "description",
    headerName: "Description",
    flex: 1,
    headerClassName: "col-header",
    editable: true,
    renderEditCell: renderEditTextField(255),
  },
  {
    field: "ord_qty",
    headerName: "Ord Qty",
    flex: 1,
    headerClassName: "col-header",
    editable: true,
    renderEditCell: renderEditTextField(255),
  },
  {
    field: "ord_uom",
    headerName: "Ord Unit",
    flex: 1,
    headerClassName: "col-header",
    editable: true,
    renderEditCell: renderEditTextField(255),
  },
  {
    field: "rec_qty",
    headerName: "Rec Qty",
    flex: 1,
    headerClassName: "col-header",
    editable: true,
    renderEditCell: renderEditTextField(255),
  },
  {
    field: "qty_due",
    headerName: "Qty Due",
    flex: 1,
    headerClassName: "col-header",
    editable: true,
    renderEditCell: renderEditTextField(255),
  },
  {
    field: "total_qty_received",
    headerName: "Total Qty Rec",
    flex: 1,
    headerClassName: "col-header",
    editable: true,
    renderEditCell: renderEditTextField(255),
  },
  {
    field: "rec_uom",
    headerName: "Rec Unit",
    flex: 1,
    headerClassName: "col-header",
    editable: true,
    renderEditCell: renderEditTextField(255),
  },
  {
    field: "rotating",
    headerName: "Rotating",
    flex: 1,
    headerClassName: "col-header",
    editable: true,
    renderEditCell: renderEditTextField(255),
    valueFormatter: (val) => (!val ? "No" : "Yes"),
  },
  {
    field: "assetItems",
    headerName: "Asset",
    flex: 1,
    headerClassName: "col-header",
    editable: true,
    renderEditCell: renderEditTextField(255),
  },
  {
    field: "boxItems",
    headerName: "Box/Piece",
    flex: 1,
    headerClassName: "col-header",
    editable: true,
    renderEditCell: renderEditTextField(255),
  },
];

// ---------------------------------------------------------------------------
// Main controller component
// ---------------------------------------------------------------------------

export default function LineItemsGridController(
  props: LineItemsGridControllerProps
) {
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [addDisabled, setAddDisabled] = useState(false);
  const [rows, setRows] = useState<GridRowModel[]>(props.data ?? []);
  // apiResponse / setApiResponse are wired to handleProcessRowUpdate which is
  // commented out in the PDF pending API integration — retained to avoid refactor churn.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [apiResponse, setApiResponse] = useState<unknown>(null);
  const [openLoader, setOpenLoader] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [severity, setSeverity] = useState<string | null>(null);

  // Sync rows when parent data prop changes
  useEffect(() => {
    setRows(props.data);
  }, [props.data]);

  // Hide loader once an API response lands
  useEffect(() => {
    if (apiResponse) {
      setOpenLoader(false);
    }
  }, [apiResponse]);

  // Disable the Add button while any row is being edited
  useEffect(() => {
    if (Object.keys(rowModesModel).length === 0) {
      setAddDisabled(false);
    } else {
      setAddDisabled(true);
    }
  }, [rowModesModel]);

  // ---------------------------------------------------------------------------
  // Snackbar close handler
  // ---------------------------------------------------------------------------

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  // ---------------------------------------------------------------------------
  // Row validation
  // ---------------------------------------------------------------------------

  // isRowValid / handleEditClick / handleCancelClick / handleUpdateClick are passed
  // as action-cell callbacks once LineItemsGrid is converted from its PDF.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isRowValid = (row: GridRowModel) => {
    let valid = true;

    if (!row.description || String(row.description).trim() === "") {
      valid = false;
    }
    if (!row.line_number || String(row.line_number).trim() === "") {
      valid = false;
    }

    const existingDiscrepancy = rows.find(
      (r) => r.line_number === row.line_number && r.id !== row.id
    );
    if (existingDiscrepancy) {
      valid = false;
    }

    return valid;
  };

  // ---------------------------------------------------------------------------
  // Row action handlers
  // ---------------------------------------------------------------------------

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleEditClick = (id: GridRowId) => () => {
    const indexToFocus = cols.findIndex((c) => c.editable === true);
    setRowModesModel({
      ...rowModesModel,
      [id]: {
        mode: GridRowModes.Edit,
        fieldToFocus: cols[indexToFocus]?.field ?? "line_number",
      },
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCancelClick = (id: GridRowId) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
    const editedRow = rows.find((row) => row.id === id);
    if (editedRow?.isNew) {
      setRows(rows.filter((row) => row.id !== id));
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleUpdateClick = (id: GridRowId) => async () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View },
    });
  };

  const handleRowModesModelChange = (
    newRowModesModel: GridRowModesModel
  ) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    events
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      // Prevent the default MUI behaviour of committing the row on focus-out
      (events as { defaultMuiPrevented?: boolean }).defaultMuiPrevented = true;
      setRowModesModel({
        ...rowModesModel,
        [params.id]: {
          mode: GridRowModes.View,
          ignoreModifications: true,
        },
      });
      const editedRow = rows.find((row) => row.id === params.id);
      if (editedRow?.isNew) {
        setRows(rows.filter((row) => row.id !== params.id));
      }
    }
  };

  // ---------------------------------------------------------------------------
  // EditToolbar — rendered as the DataGrid toolbar slot
  // ---------------------------------------------------------------------------

  function EditToolbar() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleClick = () => {
      const id = rows.length + 1;
      setRows((oldRows) => [
        {
          id: -1,
          line_number: "",
          description: "",
          isNew: true,
        },
        ...oldRows,
      ]);
      setRowModesModel((oldModel) => ({
        ...oldModel,
        [-1]: {
          mode: GridRowModes.Edit,
          fieldToFocus: "line_number",
        },
      }));
    };

    return (
      <GridToolbarContainer>
        <Button
          disabled={addDisabled}
          className="button-light"
          startIcon={<Add />}
          color="primary"
          onClick={() => {}}
        >
          Receive Balance Selected
        </Button>
        <Button
          className="button-light"
          startIcon={<Add />}
          color="primary"
          onClick={() => {}}
        >
          Clear
        </Button>
      </GridToolbarContainer>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <Box className="simpleGrid-small" sx={{ marginLeft: "1rem" }}>
      <MySnackbar
        open={openSnackbar}
        onClose={handleClose}
        autoHideDuration={8000}
        message={message ?? ""}
        severity={(severity ?? "info") as "error" | "info" | "success" | "warning"}
      />
      <BackdropLoader open={openLoader} />
      <Box className="simpleGrid__headerBox">
        <h4>Line Items</h4>
      </Box>
      {props.active !== false && (
        <LineItemsGrid
          rowsData={rows}
          cols={cols}
          rowModesModel={rowModesModel}
          setRowModesModel={setRowModesModel}
          setRows={setRows}
          handleRowModesModelChange={handleRowModesModelChange}
          toolbar={EditToolbar}
          handleRowEditStop={handleRowEditStop}
        />
      )}
    </Box>
  );
}
