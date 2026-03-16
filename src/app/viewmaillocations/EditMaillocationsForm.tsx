"use client";

import BackdropLoader from "@/components/BackdropLoader";
import { loadEnvironment } from "@/utils/EnvironmentUtils";
import {
  Autocomplete,
  AutocompleteRenderInputParams,
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Stack,
  TextField,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";

const LOCATION_TYPE_BUILDING = 1;
const LOCATION_TYPE_ADDRESS = 3;

type LocationTypeId =
  | typeof LOCATION_TYPE_BUILDING
  | typeof LOCATION_TYPE_ADDRESS
  | null;

type FormState = {
  id: number | null;
  active: boolean | null;
  locationType: LocationTypeId;
  buildingId: number | null;
  address: string;
};

type BuildingLocation = {
  id: number;
  buildingName: string;
};

export type EditMaillocationsFormProps = {
  maillocation: any;
  buildingLocations: BuildingLocation[];
  setFormValid: Dispatch<SetStateAction<boolean>>;
  save: boolean;
  setOpenSnackbar: Dispatch<SetStateAction<boolean>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setSeverity: Dispatch<SetStateAction<any>>;
  setRows: Dispatch<SetStateAction<any[]>>;
  rows: any[];
  onClose?: () => void;
};

function toFormState(maillocation: any): FormState {
  const source = maillocation ?? {};
  const location = source.location ?? {};
  const locationTypeId = Number(location.locationType?.id);

  return {
    id: source.id ?? null,
    active: typeof source.active === "boolean" ? source.active : null,
    locationType:
      locationTypeId === LOCATION_TYPE_BUILDING ||
      locationTypeId === LOCATION_TYPE_ADDRESS
        ? (locationTypeId as LocationTypeId)
        : null,
    buildingId: location.buildingId ?? null,
    address: location.address ?? "",
  };
}

function toSavePayload(formState: FormState) {
  return {
    active: Boolean(formState.active),
    locationType: formState.locationType,
    buildingId:
      formState.locationType === LOCATION_TYPE_BUILDING
        ? formState.buildingId
        : null,
    address:
      formState.locationType === LOCATION_TYPE_ADDRESS
        ? formState.address.trim()
        : null,
  };
}

export default function EditMaillocationsForm({
  maillocation,
  buildingLocations,
  setFormValid,
  save,
  setOpenSnackbar,
  setMessage,
  setSeverity,
  setRows,
  rows,
  onClose,
}: EditMaillocationsFormProps) {
  const [maillocationData, setMaillocationData] = useState<FormState>(
    toFormState(maillocation),
  );
  const [saving, setSaving] = useState(false);
  const postApi = "/maillocation/";

  const isRequiredValid = useMemo(() => {
    if (maillocationData.locationType === null) {
      return false;
    }
    if (maillocationData.active === null) {
      return false;
    }
    if (
      maillocationData.locationType === LOCATION_TYPE_BUILDING &&
      !maillocationData.buildingId
    ) {
      return false;
    }
    if (
      maillocationData.locationType === LOCATION_TYPE_ADDRESS &&
      !maillocationData.address.trim()
    ) {
      return false;
    }
    return true;
  }, [maillocationData]);

  useEffect(() => {
    setMaillocationData(toFormState(maillocation));
  }, [maillocation]);

  function isFormDirty() {
    const original = toSavePayload(toFormState(maillocation));
    const current = toSavePayload(maillocationData);
    return JSON.stringify(original) !== JSON.stringify(current);
  }

  useEffect(() => {
    const canSave =
      isRequiredValid && (maillocationData.id === null || isFormDirty());
    setFormValid(canSave);
  }, [isRequiredValid, maillocationData, maillocation, setFormValid]);

  async function handleSave() {
    if (!isRequiredValid) {
      setMessage("Please complete required fields.");
      setSeverity("error");
      setOpenSnackbar(true);
      return;
    }

    const env = await loadEnvironment();
    const baseUrl = env.api?.server || "";
    const payload = toSavePayload(maillocationData);

    try {
      setSaving(true);

      let responseData: {
        success: boolean;
        data?: { id: number };
        failureMessage?: string;
      };

      if (env.mock) {
        // No backend connected — simulate a successful save locally
        responseData = {
          success: true,
          data: { id: maillocationData.id ?? Date.now() },
        };
      } else {
        const res = await fetch(baseUrl + postApi, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        responseData = await res.json();
      }

      if (responseData.success) {
        const updatedId = responseData?.data?.id ?? maillocationData.id;
        const locationName =
          payload.locationType === LOCATION_TYPE_BUILDING
            ? (buildingLocations.find((b) => b.id === payload.buildingId)
                ?.buildingName ?? "")
            : (payload.address ?? "");
        const updatedRow = {
          ...maillocation,
          id: updatedId,
          active: payload.active,
          locationName,
          location: {
            ...(maillocation?.location ?? {}),
            buildingId: payload.buildingId,
            address: payload.address,
            locationType: { id: payload.locationType },
            name: locationName,
          },
        };

        const rowExists = rows.findIndex((r) => r.id === updatedId);
        setMessage("Save Successful!");
        setSeverity("success");
        setOpenSnackbar(true);
        if (rowExists !== -1) {
          setRows(rows.map((r) => (r.id === updatedId ? updatedRow : r)));
        } else {
          setRows([updatedRow, ...rows]);
        }
        onClose?.();
      } else {
        setMessage(responseData.failureMessage || "Save Failed");
        setSeverity("error");
        setOpenSnackbar(true);
      }
    } catch (e) {
      setMessage("Server Error");
      setSeverity("error");
      setOpenSnackbar(true);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (save) {
      handleSave();
    }
  }, [save]);

  const selectedBuilding =
    buildingLocations.find((b) => b.id === maillocationData.buildingId) ?? null;

  const handleLocationTypeChange = (e: ChangeEvent<HTMLInputElement>) => {
    const nextType = Number(e.target.value) as LocationTypeId;
    setMaillocationData((prev: FormState) => ({
      ...prev,
      locationType: nextType,
      buildingId: nextType === LOCATION_TYPE_BUILDING ? prev.buildingId : null,
      address: nextType === LOCATION_TYPE_ADDRESS ? prev.address : "",
    }));
  };

  const handleActiveChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMaillocationData((prev: FormState) => ({
      ...prev,
      active: e.target.value === "true",
    }));
  };

  const handleAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setMaillocationData((prev: FormState) => ({
      ...prev,
      address: e.target.value.slice(0, 4000),
    }));
  };

  return (
    <Box sx={{ padding: "1rem" }}>
      <BackdropLoader open={saving} />
      <div className="form__section">
        <Grid2 columnGap={1} columnSpacing={2} rowSpacing={1} container>
          <Stack flexGrow={1} spacing={2}>
            <Grid2>
              <FormControl required>
                <FormLabel>Location Type</FormLabel>
                <RadioGroup
                  row
                  name="location-type"
                  value={maillocationData.locationType ?? ""}
                  onChange={handleLocationTypeChange}
                >
                  <FormControlLabel
                    value={LOCATION_TYPE_BUILDING}
                    control={<Radio />}
                    label="Building"
                  />
                  <FormControlLabel
                    value={LOCATION_TYPE_ADDRESS}
                    control={<Radio />}
                    label="Address"
                  />
                </RadioGroup>
              </FormControl>
            </Grid2>

            {maillocationData.locationType === LOCATION_TYPE_BUILDING && (
              <Grid2>
                <Autocomplete
                  fullWidth
                  options={buildingLocations}
                  value={selectedBuilding}
                  onChange={(
                    _event: unknown,
                    newValue: BuildingLocation | null,
                  ) => {
                    setMaillocationData((prev: FormState) => ({
                      ...prev,
                      buildingId: newValue?.id ?? null,
                    }));
                  }}
                  renderInput={(params: AutocompleteRenderInputParams) => (
                    <TextField
                      {...params}
                      variant="filled"
                      label="Building Location"
                      helperText="Required when location type is Building"
                      required
                    />
                  )}
                  getOptionLabel={(option: BuildingLocation) =>
                    option.buildingName || ""
                  }
                  isOptionEqualToValue={(
                    option: BuildingLocation,
                    value: BuildingLocation,
                  ) => option.id === value.id}
                />
              </Grid2>
            )}

            {maillocationData.locationType === LOCATION_TYPE_ADDRESS && (
              <Grid2>
                <TextField
                  fullWidth
                  label="Address"
                  variant="filled"
                  multiline
                  minRows={4}
                  value={maillocationData.address}
                  onChange={handleAddressChange}
                  inputProps={{ maxLength: 4000 }}
                  helperText="Required when location type is Address"
                  required
                />
              </Grid2>
            )}

            <Grid2>
              <FormControl
                required
                sx={{ flexDirection: "row", alignItems: "center" }}
              >
                <FormLabel>Active:</FormLabel>
                <RadioGroup
                  sx={{ flexDirection: "row", margin: "0 1rem" }}
                  name="active-group"
                  value={
                    maillocationData.active === null
                      ? ""
                      : String(maillocationData.active)
                  }
                  onChange={handleActiveChange}
                >
                  <FormControlLabel
                    value="true"
                    control={<Radio />}
                    label="Yes"
                  />
                  <FormControlLabel
                    value="false"
                    control={<Radio />}
                    label="No"
                  />
                </RadioGroup>
              </FormControl>
            </Grid2>
          </Stack>
        </Grid2>
      </div>
    </Box>
  );
}
