"use client";

import {
  GridColDef,
  GridRowModesModel,
  GridToolbarContainer,
  useGridApiRef,
} from "@mui/x-data-grid";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  InputAdornment,
  SnackbarCloseReason,
  TextField,
} from "@mui/material";
import ClearIcon from "@mui/icons-material/Clear";
import { useEffect, useMemo, useState } from "react";
import EditMaillocationsForm from "./EditMaillocationsForm";
import Maillocations from "./Maillocations";
import {
  useFetchBuildings,
  useFetchMaillocations,
} from "../ServiceHooks/services";
import MySnackbar from "@/components/MySnackbar";
import Loading from "@/components/Loading";

interface EditToolbarProps {
  locationSearchInput: string;
  onSearchInputChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  showActiveOnly: boolean;
  onActiveOnlyChange: (checked: boolean) => void;
  onAddClick: () => void;
}

function EditToolbar({
  locationSearchInput,
  onSearchInputChange,
  onSearch,
  onClear,
  showActiveOnly,
  onActiveOnlyChange,
  onAddClick,
}: EditToolbarProps) {
  return (
    <GridToolbarContainer
      sx={{ gap: 1, p: 1, flexWrap: "wrap", alignItems: "center" }}
    >
      <Button variant="text" onClick={onAddClick}>
        Add
      </Button>

      <TextField
        size="small"
        label="Location"
        value={locationSearchInput}
        onChange={(e) => onSearchInputChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSearch();
        }}
        InputProps={{
          endAdornment: locationSearchInput ? (
            <InputAdornment position="end">
              <IconButton size="small" onClick={onClear} edge="end">
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />

      <Button variant="outlined" onClick={onSearch}>
        Search
      </Button>

      <FormControlLabel
        control={
          <Checkbox
            checked={showActiveOnly}
            onChange={(e) => onActiveOnlyChange(e.target.checked)}
          />
        }
        label="Active only"
      />
    </GridToolbarContainer>
  );
}

export default function MaillocationsController() {
  const apiRef = useGridApiRef();

  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [rows, setRows] = useState<any[]>([]);
  const [buildingLocations, setBuildingLocations] = useState<any[]>([]);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<any>("success");

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 25,
  });

  const [sortModel, setSortModel] = useState([
    { field: "startTimestamp", sort: "asc" },
  ]);

  const [openForm, setOpenForm] = useState(false);
  const [formValid, setFormValid] = useState(false);
  const [save, setSave] = useState(false);

  const [locationSearchInput, setLocationSearchInput] = useState("");
  const [locationSearchTerm, setLocationSearchTerm] = useState("");
  const [showActiveOnly, setShowActiveOnly] = useState(false);

  const emptyMailLocation = {
    id: null,
    location: null,
    active: true,
    locationName: "",
  };

  const [initialMaillocation, setInitialMaillocation] =
    useState<any>(emptyMailLocation);

  const { data, loading } = useFetchMaillocations();
  const { buildings: buildingsData, buildingsLoading } = useFetchBuildings();

  useEffect(() => {
    if (!loading) {
      setRows(data ?? []);
    }
  }, [loading, data]);

  useEffect(() => {
    if (!buildingsLoading) {
      setBuildingLocations(buildingsData ?? []);
    }
  }, [buildingsLoading, buildingsData]);

  const filteredRows = useMemo(() => {
    const normalizedSearch = locationSearchTerm.trim().toLowerCase();

    return rows.filter((row) => {
      const locationName = String(
        row?.locationName ?? row?.location?.name ?? "",
      ).toLowerCase();
      const matchesLocation =
        !normalizedSearch || locationName.includes(normalizedSearch);
      const matchesActive = !showActiveOnly || row?.active === true;
      return matchesLocation && matchesActive;
    });
  }, [rows, locationSearchTerm, showActiveOnly]);

  const handleSearch = () => {
    setLocationSearchTerm(locationSearchInput.trim());
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleClear = () => {
    setLocationSearchInput("");
    setLocationSearchTerm("");
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

  const handleSnackbarClose = (
    _event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSave(false);
    setInitialMaillocation(emptyMailLocation);
  };

  const cols: GridColDef[] = [
    {
      field: "id",
      headerName: "id",
      flex: 1,
      headerClassName: "col-header",
      type: "string",
    },
    {
      field: "locationName",
      headerName: "Location",
      flex: 1,
      headerClassName: "col-header",
      type: "string",
    },
    {
      field: "active",
      headerName: "Active",
      flex: 1,
      headerClassName: "col-header",
      type: "boolean",
    },
  ];

  return buildingsLoading || loading ? (
    <Loading />
  ) : (
    <Box className="simpleGrid">
      <MySnackbar
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        autoHideDuration={8000}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />

      <Dialog open={openForm} onClose={handleCloseForm} fullWidth maxWidth="md">
        <DialogTitle>
          {initialMaillocation?.id
            ? "Edit Mail Location"
            : "Add New Mail Location"}
        </DialogTitle>
        <DialogContent>
          <EditMaillocationsForm
            maillocation={initialMaillocation}
            buildingLocations={buildingLocations}
            setFormValid={setFormValid}
            save={save}
            setOpenSnackbar={setSnackbarOpen}
            setMessage={setSnackbarMessage}
            setSeverity={setSnackbarSeverity}
            setRows={setRows}
            rows={rows}
            onClose={handleCloseForm}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button
            onClick={() => setSave(true)}
            variant="contained"
            disabled={!formValid}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Box className="simpleGrid__headerBox">
        <h1>View Mail Locations</h1>
      </Box>

      <Maillocations
        apiRef={apiRef}
        rowsData={filteredRows}
        cols={cols}
        rowModesModel={rowModesModel}
        setRowModesModel={setRowModesModel}
        setRows={setRows}
        toolbar={EditToolbar}
        toolbarSlotProps={{
          locationSearchInput,
          onSearchInputChange: setLocationSearchInput,
          onSearch: handleSearch,
          onClear: handleClear,
          showActiveOnly,
          onActiveOnlyChange: (checked: boolean) => {
            setShowActiveOnly(checked);
            setPaginationModel((prev) => ({ ...prev, page: 0 }));
          },
          onAddClick: () => {
            setInitialMaillocation(emptyMailLocation);
            setSave(false);
            setOpenForm(true);
          },
        }}
        paginationModel={paginationModel}
        handlePagination={setPaginationModel}
        sortModel={sortModel}
        handleSortChange={setSortModel}
        onRowDoubleClick={(params) => {
          setSave(false);
          setInitialMaillocation(params?.row ?? emptyMailLocation);
          setOpenForm(true);
        }}
      />
    </Box>
  );
}
