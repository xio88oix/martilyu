"use client";

import { Add } from "@mui/icons-material";
import {
  GridRowModes,
  GridActionsCellItem,
  GridEventListener,
  GridRowEditStopReasons,
  GridRowId,
  GridRowModesModel,
  GridSlotProps,
  GridToolbarContainer,
  GridRowModel,
  GridRenderCellParams,
  useGridApiContext,
} from "@mui/x-data-grid";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  SnackbarCloseReason,
  TextField,
  Typography,
} from "@mui/material";
import BackdropLoader from "@/components/BackdropLoader";
import MySnackbar from "@/components/MySnackbar";
import BoxAttributesGrid from "./BoxAttributesGrid";

// NOTE: useFetchShippingRegions is not yet present in ServiceHooks/services.
// Stub provided so this file compiles. Remove once the real hook is available.
function useFetchShippingRegions() {
  return { count: 0, data: [] as any[], loading: false };
}

// NOTE: useApiUrl is not yet present in @/utils/ApiUtils.
// Stub provided so this file compiles. Remove once the real utility is available.
function useApiUrl(path: string): string {
  return path;
}

// NOTE: BoxAttributesGrid sibling TSX not yet converted.
// The import above resolves once BoxAttributesGrid.tsx is generated from BoxAttrributeGrid.pdf.

interface BoxAttributesGridControllerProps {
  data: any[]; // TODO: improve typing once BoxAttributeRow interface is defined
}

export default function BoxAttributesGridController(
  props: BoxAttributesGridControllerProps
) {
  // const { count, data, loading } = useFetchShippingRegions();
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [addDisabled, setAddDisabled] = useState(false);
  const [rows, setRows] = useState(props.data ?? []);
  // const postApi = useApiUrl("/shippingRegion");
  // const updateApi = useApiUrl("/shippingRegion/");
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [openLoader, setOpenLoader] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [severity, setSeverity] = useState<
    "success" | "error" | "warning" | "info" | null
  >(null);

  // Custom Edit component for the datagrid for validation styling
  function EditTextField(parentProp: {
    props: GridRenderCellParams;
    limit: number;
  }) {
    const { id, value, field, hasFocus } = parentProp.props;
    const apiRef = useGridApiContext();
    const ref = useRef<HTMLDivElement>(null);
    const handleChange = (event: any) => {
      // TODO: improve typing — event should be React.ChangeEvent<HTMLInputElement>
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

  const renderEditTextField =
    (maxLength: number) => (params: GridRenderCellParams) => {
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

  function CustomFooter() {
    return (
      <Box sx={{ display: "flex" }}>
        <Typography
          variant="h5"
          color={"#23404f"}
          fontWeight={"700 !important"}
          margin={"0 2rem"}
        >
          {"Total Boxes: "}
        </Typography>
        <Typography
          variant="h5"
          color={"#23404f"}
          fontWeight={"700 !important"}
          margin={"0 2rem"}
        >
          {"Total Length (in): "}
        </Typography>
        <Typography
          variant="h5"
          color={"#23404f"}
          fontWeight={"700 !important"}
          margin={"0 2rem"}
        >
          {"Total Width (in): "}
        </Typography>
        <Typography
          variant="h5"
          color={"#23404f"}
          fontWeight={"700 !important"}
          margin={"0 2rem"}
        >
          {"Total Height (in): "}
        </Typography>
        <Typography
          variant="h5"
          color={"#23404f"}
          fontWeight={"700 !important"}
          margin={"0 2rem"}
        >
          {"Total Weight (lb): "}
        </Typography>
      </Box>
    );
  }

  function EditToolbar(props: GridSlotProps["toolbar"]) {
    const { setRows, setRowModesModel } = props as {
      setRows: React.Dispatch<React.SetStateAction<any[]>>;
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
        <Button
          className="button-light"
          startIcon={<Add />}
          color="primary"
          onClick={() => {}}
        >
          Add Multiple
        </Button>
      </GridToolbarContainer>
    );
  }

  const isRowValid = (row: any) => {
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
    const indexToFocus = cols.findIndex((c) => c.editable === true);
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
    if (editedRow!.isNew) {
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
      if (editedRow!.isNew) {
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
  //           headers: { "Content-Type": "application/json" },
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
  //           headers: { "Content-Type": "application/json" },
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
      field: "boxId",
      headerName: "Box #",
      flex: 1,
      headerClassName: "col-header",
      editable: true,
      renderEditCell: renderEditTextField(25),
    },
    {
      field: "boxType",
      headerName: "Type",
      flex: 1,
      headerClassName: "col-header",
      editable: true,
      renderEditCell: renderEditTextField(255),
    },
    {
      field: "length",
      headerName: "Length (in)",
      flex: 1,
      headerClassName: "col-header",
      editable: true,
      renderEditCell: renderEditTextField(255),
    },
    {
      field: "width",
      headerName: "Width (in)",
      flex: 1,
      headerClassName: "col-header",
      editable: true,
      renderEditCell: renderEditTextField(255),
    },
    {
      field: "height",
      headerName: "Height (in)",
      flex: 1,
      headerClassName: "col-header",
      editable: true,
      renderEditCell: renderEditTextField(255),
    },
    {
      field: "weight",
      headerName: "Weight(lb)",
      flex: 1,
      headerClassName: "col-header",
      editable: true,
      renderEditCell: renderEditTextField(255),
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
    <Box
      className="simpleGrid"
      sx={{ margin: "0", marginLeft: "1rem", height: "40vh" }}
    >
      <MySnackbar
        open={openSnackbar}
        onClose={handleClose}
        autoHideDuration={8000}
        message={message ?? ""}
        severity={severity ?? "info"}
      />
      <BackdropLoader open={openLoader} />
      <Box className="simpleGrid__headerBox">
        <h4>Box Attributes</h4>
      </Box>
      <BoxAttributesGrid
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
      <CustomFooter />
    </Box>
  );
}
