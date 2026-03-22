"use client";

import { Add } from "@mui/icons-material";
import {
  GridRowModes,
  GridEventListener,
  GridRowEditStopReasons,
  GridRowId,
  GridRowModesModel,
  GridSlotProps,
  GridToolbarContainer,
  GridRenderCellParams,
  useGridApiContext,
} from "@mui/x-data-grid";
// NOTE: useFetchShippingRegions is not yet exported from services.tsx — stub import kept for future use
// import { useFetchShippingRegions } from "../ServiceHooks/services";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  SnackbarCloseReason,
  TextField,
} from "@mui/material";
import BackdropLoader from "@/components/BackdropLoader";
import MySnackbar from "@/components/MySnackbar";
// NOTE: @/utils/ApiUtils does not exist yet — useApiUrl is stubbed here and only used in commented-out lines below
// import { useApiUrl } from "@/utils/ApiUtils";
import ReferenceTrackingGrid from "./ReferenceTrackingGrid";
import dayjs from "dayjs";

// Row shape for the reference/tracking grid
interface ReferenceTrackingRow {
  id: number;
  reference_number?: string;
  comments?: string;
  scanneddate?: string | null;
  reference_nbr_type_id?: number;
  shortDescription?: string;
  longDescription?: string;
  isNew?: boolean;
}

export default function ReferenceTrackingGridController(props: {
  data: any[];
}) {
  // const { count, data, loading } = useFetchShippingRegions();
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [addDisabled, setAddDisabled] = useState(false);
  const [rows, setRows] = useState<ReferenceTrackingRow[]>(props.data ?? []);
  // const postApi = useApiUrl("/shippingRegion");
  // const updateApi = useApiUrl("/shippingRegion/");
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [openLoader, setOpenLoader] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [severity, setSeverity] = useState<
    "success" | "error" | "warning" | "info" | null
  >(null);

  const TypeMap: Record<number, string> = {
    1: "SON",
    2: "Genesis PO",
    3: "Cable Reference Number",
    4: "Other",
    5: "Genesis Indicator Number",
    6: "State Department Indicator Number",
    7: "Department of Defense Indicator Number",
    8: "Agency Indicator Number",
    9: "Air WayBill Indicator Number",
    10: "Government Bill of Landing (GBL) Indicator Number",
    11: "Shipping Tracking Number",
    12: "iFMS Purchase Order Number",
    13: "Pouch Number",
    14: "Serial Number",
    15: "Genesis Asset Transaction Number",
    16: "Project Financial Identifier",
    17: "DOD TCN",
    18: "FS Maximo ID",
    19: "BASIS Contract ID",
    20: "ESMT ID",
    21: "Vendor Purchase Order Number",
    22: "Vendor Tracking Number",
    23: "PACAC ID",
    24: "BCR Request ID",
    25: "PSC Order Number",
    26: "Genesis RMTS Number",
    27: "Genesis RFM",
    28: "Genesis Inventory Usage",
    29: "Ascent/E-supply",
    30: "LOC Delivery w/o Procurement Number - RLO (TDOS Internal Use Only)",
    31: "Genesis Accountable Property Number",
    32: "Temis eTag Number",
    33: "SCS Task Order Number",
  };

  useEffect(() => {
    console.log("The value of rows is: ", props.data);
    setRows(props.data);
  }, [props.data]);

  // Custom Edit component for the datagrid for validation styling
  function EditTextField(parentProp: {
    props: GridRenderCellParams;
    limit: number;
  }) {
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
        error={String(value ?? "").trim() === ""}
        value={value}
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

  const renderEditTextField = (maxLength: number) => (params: GridRenderCellParams) => {
    return <EditTextField props={{ ...params }} limit={maxLength} />;
  };

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  useEffect(() => {
    if (apiResponse) {
      setOpenLoader(false);
    }
  }, [apiResponse]);

  // useEffect(() => {
  //   if (!loading) {
  //     setRows(data);
  //   }
  // }, [loading]);

  useEffect(() => {
    if (Object.keys(rowModesModel).length === 0) {
      setAddDisabled(false);
    } else {
      setAddDisabled(true);
    }
  }, [rowModesModel]);

  function EditToolbar(props: GridSlotProps["toolbar"]) {
    const { setRows, setRowModesModel } = props as {
      setRows: React.Dispatch<React.SetStateAction<ReferenceTrackingRow[]>>;
      setRowModesModel: React.Dispatch<React.SetStateAction<GridRowModesModel>>;
    };
    const handleClick = () => {
      setRows((oldRows) => [
        {
          id: -1,
          shortDescription: "",
          longDescription: "",
          isNew: true,
        },
        ...oldRows,
      ]);
      setRowModesModel((oldModel) => ({
        [-1]: { mode: GridRowModes.Edit, fieldToFocus: "serviceHubName" },
      }));
    };

    return (
      <GridToolbarContainer>
        <Button
          disabled={addDisabled}
          className="button-light"
          startIcon={<Add />}
          color="primary"
          onClick={handleClick}
        >
          Add
        </Button>
        <Button
          className="button-light"
          startIcon={<Add />}
          color="primary"
          onClick={() => {}}
        >
          Remove
        </Button>
      </GridToolbarContainer>
    );
  }

  const isRowValid = (row: ReferenceTrackingRow) => {
    let valid = true;

    if (!row.longDescription || row.longDescription.trim() === "") {
      valid = false;
    }
    if (!row.shortDescription || row.shortDescription.trim() === "") {
      valid = false;
    }
    const existingDiscrepancy = rows.find(
      (r) => r.shortDescription === row.shortDescription && r.id !== row.id
    );
    if (existingDiscrepancy) {
      valid = false;
    }

    return valid;
  };

  const handleEditClick = (id: GridRowId) => () => {
    const indexToFocus = cols.findIndex((c: any) => c.editable === true);
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: cols[indexToFocus].field },
    });
  };

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

  const handleUpdateClick = (id: GridRowId) => async () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View },
    });
  };

  const handleRowModesModelChange = (newRowModesModel: GridRowModesModel) => {
    setRowModesModel(newRowModesModel);
  };

  const handleRowEditStop: GridEventListener<"rowEditStop"> = (
    params,
    events
  ) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      events.defaultMuiPrevented = true;
      setRowModesModel({
        ...rowModesModel,
        [params.id]: { mode: GridRowModes.View, ignoreModifications: true },
      });
      const editedRow = rows.find((row) => row.id === params.id);
      if (editedRow?.isNew) {
        setRows(rows.filter((row) => row.id !== params.id));
      }
    }
  };

  // const handleProcessRowUpdate = async (newRow: GridRowModel) => {
  //   let updatedRow = { ...newRow };
  //   let somethingChanged = false;
  //   cols.map((col) => {
  //     let field = col.field;
  //     let existingRow = rows.findIndex((r) => r.id === updatedRow.id);
  //     if (existingRow < 0) {
  //       somethingChanged = true;
  //     } else {
  //       if (rows[existingRow][field] !== updatedRow[field]) {
  //         somethingChanged = true;
  //       }
  //     }
  //   });
  //   let currentRow = rows.find((r) => r.id === updatedRow.id);
  //   let updateSuccess = false;
  //   if (somethingChanged && isRowValid(updatedRow)) {
  //     if (updatedRow.id < 0) {
  //       setOpenLoader(true);
  //       const newBody = {
  //         id: null,
  //         longDescription: updatedRow.longDescription,
  //         shortDescription: updatedRow.shortDescription,
  //         active: true,
  //       };
  //       try {
  //         await fetch(postApi, {
  //           method: "POST",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify(newBody),
  //         })
  //           .then((res) => res.json())
  //           .then((data) => {
  //             setApiResponse(data);
  //             if (data.success) {
  //               updatedRow = { ...updatedRow, id: data.data.id };
  //               setMessage("Save Successful!");
  //               setSeverity("success");
  //               setOpenSnackbar(true);
  //               setRows(rows.map((r) => (r.id === newRow.id ? updatedRow : r)));
  //               updateSuccess = true;
  //             } else {
  //               setMessage(data.failureMessage);
  //               setSeverity("error");
  //               setOpenSnackbar(true);
  //               setRows(rows.filter((r) => r.id !== -1));
  //             }
  //           });
  //       } catch (e) {
  //         console.log(e);
  //         setMessage("Server Error");
  //         setSeverity("error");
  //         setOpenSnackbar(true);
  //         // setRows(rows.filter((r) => r.id !== -1));
  //         setOpenLoader(false);
  //         return;
  //       }
  //     } else {
  //       setOpenLoader(true);
  //       try {
  //         await fetch(updateApi + newRow.id, {
  //           method: "PUT",
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //           body: JSON.stringify(updatedRow),
  //         })
  //           .then((res) => res.json())
  //           .then((data) => {
  //             setApiResponse(data);
  //             if (data.success) {
  //               setMessage("Update Successful!");
  //               setSeverity("success");
  //               setOpenSnackbar(true);
  //               setRows(rows.map((r) => (r.id === newRow.id ? updatedRow : r)));
  //               updateSuccess = true;
  //             } else {
  //               setMessage(data.failureMessage);
  //               setSeverity("error");
  //               setOpenSnackbar(true);
  //               setRows(rows);
  //             }
  //           });
  //       } catch (e) {
  //         console.log(e);
  //         setMessage("Server Error");
  //         setSeverity("error");
  //         setOpenSnackbar(true);
  //         // setRows(rows.filter((r) => r.id !== -1));
  //         setOpenLoader(false);
  //         return;
  //       }
  //     }
  //   }
  //   if (!isRowValid(updatedRow)) {
  //     setMessage("Invalid Input Values!");
  //     setSeverity("error");
  //     setOpenSnackbar(true);
  //     return;
  //   }
  //   return updateSuccess ? updatedRow : currentRow;
  // };

  const cols = [
    { field: "id" },
    {
      field: "reference_number",
      headerName: "Reference Number",
      flex: 1,
      headerClassName: "col-header",
      editable: true,
      renderEditCell: renderEditTextField(25),
    },
    {
      field: "comments",
      headerName: "Comments",
      flex: 1,
      headerClassName: "col-header",
      editable: true,
      renderEditCell: renderEditTextField(255),
    },
    {
      field: "scanneddate",
      headerName: "Date/Time Scanned",
      flex: 1,
      headerClassName: "col-header",
      editable: true,
      renderEditCell: renderEditTextField(255),
      type: "date",
      valueGetter: (value: any) => (value ? dayjs(value).toDate() : null),
      valueFormatter: (value: any) =>
        value ? dayjs(value).format("MM/DD/YYYY hh:mm:ss") : null,
    },
    {
      field: "reference_nbr_type_id",
      headerName: "Type",
      flex: 1,
      headerClassName: "col-header",
      editable: true,
      renderEditCell: renderEditTextField(255),
      valueFormatter: (value: any) => TypeMap[value],
    },
  ];

  return (
    // loading ? (
    //   <>
    //     <Box sx={{ display: "flex" }}>
    //       <div
    //         style={{
    //           display: "flex",
    //           height: "70vh",
    //           flexGrow: 1,
    //           justifyContent: "center",
    //           alignItems: "center",
    //         }}
    //       >
    //         <CircularProgress />
    //       </div>
    //     </Box>
    //   </>
    // ) :
    <Box className="simpleGrid-small" sx={{ marginLeft: "1rem" }}>
      <MySnackbar
        open={openSnackbar}
        onClose={handleClose}
        autoHideDuration={8000}
        message={message ?? ""}
        severity={severity ?? "info"}
      />
      <BackdropLoader open={openLoader} />
      <Box className="simpleGrid__headerBox">
        <h4>Reference/Tracking Numbers</h4>
      </Box>
      <ReferenceTrackingGrid
        rowsData={rows}
        cols={cols}
        rowModesModel={rowModesModel}
        setRowModesModel={setRowModesModel}
        setRows={setRows}
        handleRowModesModelChange={handleRowModesModelChange}
        toolbar={EditToolbar}
        handleRowEditStop={handleRowEditStop}
        // handleProcessRowUpdate={handleProcessRowUpdate}
      />
    </Box>
  );
}
