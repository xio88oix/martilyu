"use client";

import {
  GridRowModesModel,
  GridRowsProp,
  GridValidRowModel,
  useGridApiRef,
} from "@mui/x-data-grid";
// NOTE: useFetchGBL and useFetchMovements are not yet exported from services.tsx.
// Inline stubs provided below; remove once real implementations land.
// import { useFetchGBL, useFetchMovements } from "../ServiceHooks/services";
import { useCallback, useEffect, useState } from "react";
import { Box } from "@mui/material";
import SearchResultGrid from "./SearchResultGrid";
import Loading from "@/components/Loading";

// TODO: replace with real hook once useFetchGBL is added to services.tsx
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useFetchGBL(_params: unknown): void {
  // stub
}

interface SearchResultGridControllerProps {
  rows: GridValidRowModel[];
  searchLoading: boolean;
  isCr: boolean;
  type: string;
  numberType: number;
}

export default function SearchResultGridController(
  params: SearchResultGridControllerProps
) {
  // const movements = useFetchMovements(params);
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [rows, setRows] = useState<GridRowsProp>(params.rows);
  const apiRef = useGridApiRef();

  // Wrap setRows so its signature matches SearchResultGrid's functional-updater contract.
  const handleSetRows = useCallback(
    (newRows: (oldRows: GridRowsProp) => GridRowsProp) => {
      setRows((prev) => newRows(prev));
    },
    []
  );

  // Wrap setRowModesModel to match the functional-updater contract.
  const handleSetRowModesModel = useCallback(
    (newModel: (oldModel: GridRowModesModel) => GridRowModesModel) => {
      setRowModesModel((prev) => newModel(prev));
    },
    []
  );

  const handleRowModesModelChange = useCallback(
    (newRowModesModel: GridRowModesModel) => {
      setRowModesModel(newRowModesModel);
    },
    []
  );

  const statusMap: Record<number, string> = {
    1: "Draft",
    2: "Submitted",
    3: "Approved",
    4: "In Transit",
    5: "Completed",
    6: "Cancelled",
    7: "Genesis Draft",
  };

  useEffect(() => {
    if (!params.searchLoading) {
      setRows(params.rows);
    }
  }, [params.searchLoading]);

  const crCols = [
    {
      field: "bsc",
      headerName: "Contract #",
      flex: 1,
      headerClassName: "col-header",
      type: "string",
    },
    {
      field: "son",
      headerName: "SON",
      flex: 1,
      headerClassName: "col-header",
    },
    {
      field: "dest",
      headerName: "Destination",
      flex: 1,
      headerClassName: "col-header",
    },
    {
      field: "statusid",
      headerName: "Status",
      flex: 1,
      headerClassName: "col-header",
      valueFormatter: (val: unknown) =>
        statusMap[val as number],
    },
  ];

  const otherCols = [
    {
      field: "son",
      headerName: "SON",
      flex: 1,
      headerClassName: "col-header",
      type: "string",
    },
    {
      field: "po",
      headerName: "PO",
      flex: 1,
      headerClassName: "col-header",
    },
    {
      field: "ind",
      headerName: "Reference",
      flex: 1,
      headerClassName: "col-header",
    },
    {
      field: "statusid",
      headerName: "Status",
      flex: 1,
      headerClassName: "col-header",
      valueFormatter: (val: unknown) =>
        statusMap[val as number],
    },
  ];

  return (
    <Box className="searchGrid">
      {!params.searchLoading ? (
        <>
          <Box className="searchGrid__headerBox">
            <h1>Search Results</h1>
          </Box>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <SearchResultGrid
            apiRef={apiRef}
            rowsData={[...rows]}
            cols={params.isCr ? crCols : otherCols}
            rowModesModel={rowModesModel}
            setRowModesModel={handleSetRowModesModel as any}
            setRows={handleSetRows as any}
            handleRowModesModelChange={handleRowModesModelChange}
            type={params.type}
            numberType={params.numberType}
          />
        </>
      ) : (
        <>
          <Loading />
        </>
      )}
    </Box>
  );
}
