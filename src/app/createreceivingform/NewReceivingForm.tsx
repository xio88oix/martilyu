"use client";
import {
  type Route,
  useFetchAllRoute,
} from "@/app/ServiceHooks/services";
import {
  CheckboxLarge,
  CustomTextField,
  HintBox,
  MyDatePicker,
  RadioLarge,
  SearchField,
  StyledTextField,
} from "@/components/CustomComponents";
import {
  Autocomplete,
  Box,
  FormControl,
  FormControlLabel,
  FormLabel,
  RadioGroup,
  Stack,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useUserContext } from "@/app/hooks/useUserContext";

// ---------------------------------------------------------------------------
// Route constants
// ---------------------------------------------------------------------------

const LOCAL_DELIVERY = "LOCAL DELIVERY";
const CUSTOMER_PICKUP = "CUSTOMER PICKUP";

const DEFAULT_ROUTE_ID = {
  GT: 12,
  PTI: 8,
  LOCAL_DELIVERY: 14,
  PSB_POUCH: 18,
} as const;

function normalizeRouteLabel(value: string): string {
  return value.trim().toUpperCase();
}

function toRouteId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }

    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function resolveRouteOption(routes: Route[], value: unknown): Route | null {
  const routeId = toRouteId(value);
  if (routeId !== null) {
    return routes.find((route) => route.id === routeId) ?? null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = normalizeRouteLabel(value);
  return (
    routes.find((route) => normalizeRouteLabel(route.shortDescription) === normalizedValue) ?? null
  );
}

function getDefaultRouteId(bs: ReceivingBusinessState): number | null {
  if (bs.isApticReceiving) {
    return DEFAULT_ROUTE_ID.PTI;
  }

  if (bs.isNewReceiving && !bs.draft && (bs.isBfheld || bs.isCrypto)) {
    return DEFAULT_ROUTE_ID.PSB_POUCH;
  }

  if (bs.isNewReceiving && !bs.draft && bs.isWMADestination && !bs.isBfheld && !bs.isCrypto) {
    return DEFAULT_ROUTE_ID.LOCAL_DELIVERY;
  }

  if (bs.locPackingRequired) {
    return DEFAULT_ROUTE_ID.GT;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ReceivingBusinessState {
  handDelivery: boolean;
  bcsReceiving: boolean;
  cpsReceiving: boolean;
  apticReceiving: boolean;
  recid: number | null;
  allowPackages: unknown;
  isPreviousReceipt: boolean;
  draftReceipts: boolean;
  previousReceipts: boolean;
  fromIncomingCargo: string;
  hhLite: boolean;
  received: boolean;
  draft: boolean;
  boxIdOutOfSync: boolean;
  isBfheld: boolean;
  isCrypto: boolean;
  existingDiscrepant: boolean;
  isWMADestination: boolean;
  locPackingRequired: boolean;
  isNewReceiving: boolean;
  isPreviousReceiving: boolean;
  isApticReceiving: boolean;
}

interface NewReceivingFormProps {
  data: Record<string, unknown>;
  type?: string;
  receivingBusinessState: ReceivingBusinessState;
  onFormValidityChange?: (valid: boolean) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function NewReceivingForm(props: NewReceivingFormProps) {
  const { data, type, receivingBusinessState: bs, onFormValidityChange } = props;
  const { isLOCUser, isWMAUser, isFranUser } = useUserContext();
  const { data: routeLookupData, loading: routeLookupLoading } = useFetchAllRoute();

  const routeOptions = routeLookupData?.data ?? [];
  const routeRecordKey = useMemo(
    () => JSON.stringify([data?.id, data?.receivingid, data?.sonid, data?.shippingOrderId]),
    [data?.id, data?.receivingid, data?.sonid, data?.shippingOrderId]
  );

  const [bypassBox, setBypassBox] = useState(data?.nobox === "0" ? false : true);
  const handleBypassBox = () => setBypassBox((prev) => !prev);

  const [nolines, setNoLines] = useState((data?.nolines as string) ?? "0");
  const handleChangeLines = () => setNoLines((prev) => (prev === "0" ? "1" : "0"));

  const [handdelivery, setHandDelivery] = useState(
    (data?.handdelivery as string) ?? "0"
  );
  const handleHandDelivery = () =>
    setHandDelivery((prev) => (prev === "0" ? "1" : "0"));

  const [cps, setCPS] = useState((data?.cps as string) ?? "0");
  const handleCPS = () => setCPS((prev) => (prev === "0" ? "1" : "0"));

  const existingRoute = useMemo(
    () => resolveRouteOption(routeOptions, data?.route),
    [routeOptions, data?.route]
  );

  const defaultRoute = useMemo(() => {
    const defaultRouteId = getDefaultRouteId(bs);
    return defaultRouteId === null
      ? null
      : routeOptions.find((route) => route.id === defaultRouteId) ?? null;
  }, [bs, routeOptions]);

  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [routeOverridden, setRouteOverridden] = useState(false);

  useEffect(() => {
    setRouteOverridden(false);
  }, [routeRecordKey]);

  useEffect(() => {
    if (routeOverridden) {
      return;
    }

    setSelectedRoute(existingRoute ?? defaultRoute ?? null);
  }, [defaultRoute, existingRoute, routeOverridden]);

  const handleRouteChange = (_event: React.SyntheticEvent, newValue: Route | null) => {
    setRouteOverridden(true);
    setSelectedRoute(newValue);
  };

  const routeLabel = selectedRoute?.shortDescription ?? null;
  const isHandDelivery = handdelivery === "1";

  // ---------------------------------------------------------------------------
  // Form validity — required fields per ReceivingForm-analysis.md Section 10
  // ---------------------------------------------------------------------------

  const formValid = useMemo(() => {
    if (!data?.pieces || Number(data.pieces) <= 0) return false;
    if (!data?.weight || Number(data.weight) <= 0) return false;
    if (!selectedRoute) return false;
    if (isLOCUser && !data?.packing_slip_provided) return false;
    if (handdelivery === "1") {
      if (!data?.deliveryrecipient) return false;
      if (!data?.deliverydate) return false;
    }
    if (type === "b1" && !data?.prefixcode) return false;
    return true;
  }, [data, selectedRoute, isLOCUser, handdelivery, type]);

  useEffect(() => {
    onFormValidityChange?.(formValid);
  }, [formValid, onFormValidityChange]);

  // ---------------------------------------------------------------------------
  // Derived disable / hide flags from analysis doc Section 4
  // ---------------------------------------------------------------------------

  // Date/Time In — editable when (!received || draft)
  const dateInDisabled = bs.received && !bs.draft;

  // Pieces — complex disable logic
  const piecesDisabled =
    (bs.apticReceiving && bs.received && !bs.draft) ||
    (((bs.hhLite || isWMAUser || routeLabel === LOCAL_DELIVERY) ||
      (type === "b1" && !isLOCUser)) &&
      !bs.cpsReceiving &&
      !bs.draft) ||
    (bs.draft && bs.boxIdOutOfSync && !bs.apticReceiving);

  // Weight — disabled for hhLite, WMA users, or b3 (unless draft)
  const weightDisabled =
    bs.hhLite || isWMAUser || (type === "b3" && !bs.draft);

  // Route — only LOC users can edit, under specific conditions
  const routeEnabled =
    isLOCUser &&
    type !== "b3" &&
    ((bs.received && bs.existingDiscrepant) || !existingRoute || bs.draft);

  // Packing List Provided — required for LOC; disabled when received and not draft
  const packingSlipDisabled = bs.received && !bs.draft;
  const packingSlipRequired = isLOCUser;

  // LOC-only fields: Refrigeration, Freezing, BFHELD, Crypto, Bypass Box
  const showLocOnlyFields = isLOCUser;

  // Bypass Box — disabled when received (and not draft) OR route not local/pickup
  const noboxDisabled =
    (bs.received && !bs.draft) ||
    (routeLabel !== LOCAL_DELIVERY && routeLabel !== CUSTOMER_PICKUP);

  // No Line Item Receiving — disabled unless type b5 and not a completed receipt
  const nolinesDisabled = (!bs.draft && bs.received) || type !== "b5";

  // Hand Delivery — disabled for LOC users or when already received
  const handDeliveryDisabled = isLOCUser || bs.received;

  // BASIS Prefix — shown and required only for b1
  const prefixHidden = type !== "b1";

  // Do Not Send To Genesis — hidden for non-FRAN users; disabled when received
  const qtyAdjHidden = !isFranUser;
  const qtyAdjDisabled = bs.received;

  return (
    <>
      <Box sx={{ padding: "1rem", flexGrow: 1 }}>
        {/* ----------------------------------------------------------------
            Section 1 — Dates, Pieces, Weight, Item Count, Route, Carrier
        ---------------------------------------------------------------- */}
        <div className="form-section">
          <Grid2 columnGap={1} columnSpacing={2} rowSpacing={1} container>
            <Stack flexGrow={1}>
              <Grid2>
                <MyDatePicker
                  required={true}
                  label={"Date/Time In:"}
                  className="dialog-field-width"
                  value={
                    data?.receiveddate
                      ? dayjs(data.receiveddate as string)
                      : null
                  }
                  isDisabled={dateInDisabled}
                />
              </Grid2>
              <Grid2>
                <MyDatePicker
                  label={"Date/Time Out:"}
                  className="dialog-field-width"
                  value={
                    data?.dateout ? dayjs(data.dateout as string) : null
                  }
                  isDisabled={true}
                />
              </Grid2>
              {bs.apticReceiving && (
                <>
                  <Grid2>
                    <CustomTextField
                      className="dialog-field-width"
                      label={"Total Received Pieces"}
                      variant="filled"
                      value={data?.taskreceivepieces}
                      disabled
                    />
                  </Grid2>
                  <Grid2>
                    <CustomTextField
                      className="dialog-field-width"
                      label={"Tasking Package Pieces"}
                      variant="filled"
                      value={data?.taskpackages}
                      disabled
                    />
                  </Grid2>
                </>
              )}
              <Grid2>
                <CustomTextField
                  className="dialog-field-width"
                  label={"Pieces"}
                  variant="filled"
                  required
                  inputProps={{ inputMode: "numeric", maxLength: 4 }}
                  value={data?.pieces}
                  disabled={piecesDisabled}
                />
              </Grid2>
              <Grid2>
                <HintBox
                  className="dialog-field-width"
                  hint="Measurements must be recorded as whole numbers."
                />
              </Grid2>
              <Grid2>
                <CustomTextField
                  className="dialog-field-width"
                  label={"Weight"}
                  variant="filled"
                  required
                  inputProps={{ inputMode: "numeric", maxLength: 5 }}
                  value={data?.weight}
                  disabled={weightDisabled}
                />
              </Grid2>
            </Stack>

            <Stack flexGrow={1}>
              <Grid2>
                <CustomTextField
                  className="dialog-field-width"
                  label={"Item Count"}
                  variant="filled"
                  value={data?.licount}
                  disabled
                />
              </Grid2>
              <Grid2>
                <CustomTextField
                  className="dialog-field-width"
                  label={"Item List"}
                  variant="filled"
                  value={data?.lilist}
                  disabled
                />
              </Grid2>
              <Grid2>
                <Autocomplete
                  className="dialog-field-width"
                  options={routeOptions}
                  value={selectedRoute}
                  onChange={handleRouteChange}
                  getOptionLabel={(option) => option.shortDescription}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  loading={routeLookupLoading}
                  disabled={!routeEnabled || routeLookupLoading}
                  renderInput={(params) => (
                    <StyledTextField
                      required={isLOCUser || type === "b1"}
                      {...params}
                      variant="filled"
                      label={"Route"}
                      className="section-useredit__field body1 text-onbackground"
                      helperText="Select a Route"
                    />
                  )}
                  slotProps={{
                    paper: {
                      sx: {
                        "& .MuiAutocomplete-listbox": { fontSize: "1.6rem" },
                      },
                    },
                  }}
                />
              </Grid2>
              <Grid2>
                <Autocomplete
                  className="dialog-field-width"
                  options={["item1", "item2", "item3"]}
                  value={(data?.carrier as string) ?? "SON"}
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      variant="filled"
                      label={"Carrier"}
                      className="section-useredit__field body1 text-onbackground"
                      disabled
                    />
                  )}
                  slotProps={{
                    paper: {
                      sx: {
                        "& .MuiAutocomplete-listbox": { fontSize: "1.6rem" },
                      },
                    },
                  }}
                />
              </Grid2>
            </Stack>
          </Grid2>
        </div>

        {/* ----------------------------------------------------------------
            Section 2 — Packing List, Refrigeration, Freezing, BFHELD, Crypto,
                        Bypass Box/Piece (LOC only)
        ---------------------------------------------------------------- */}
        <div className="form-section">
          <Grid2 columnGap={1} columnSpacing={2} rowSpacing={1} container>
            <Stack flexGrow={1}>
              {isLOCUser && (
                <Grid2>
                  <HintBox
                    className="dialog-field-width"
                    hint="Packing list may appear within 60 days of receiving."
                  />
                </Grid2>
              )}

              {/* Packing List Provided? */}
              <Grid2>
                <FormControl
                  sx={{ flexDirection: "row", alignItems: "center", width: "100%" }}
                  className="section-useredit__general-form"
                  disabled={packingSlipDisabled}
                >
                  <FormLabel
                    required={packingSlipRequired}
                    className="body1 text-onbackground font-medium"
                  >
                    Packing List Provided?
                  </FormLabel>
                  <RadioGroup
                    sx={{ flexDirection: "row", margin: "0 1rem" }}
                    name="radio-button-group-packing"
                    value={data?.packing_slip_provided}
                  >
                    <RadioLarge
                      className="text-onbackground font-medium"
                      value="true"
                      label="Yes"
                    />
                    <RadioLarge
                      className="text-onbackground font-medium"
                      value="false"
                      label="No"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid2>

              {/* LOC-only: Refrigeration, Freezing, BFHELD, Crypto */}
              {showLocOnlyFields && (
                <>
                  <Grid2>
                    <FormControl
                      sx={{ flexDirection: "row", alignItems: "center", width: "100%" }}
                      className="section-useredit__general-form"
                    >
                      <FormLabel
                        required
                        className="body1 text-onbackground font-medium"
                      >
                        Refrigeration Required?
                      </FormLabel>
                      <RadioGroup
                        value={data?.rcvrefrigerationreq}
                        sx={{ flexDirection: "row", margin: "0 1rem" }}
                        name="radio-button-group-refrigeration"
                      >
                        <RadioLarge
                          className="text-onbackground font-medium"
                          value="1"
                          label="Yes"
                        />
                        <RadioLarge
                          className="text-onbackground font-medium"
                          value="0"
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid2>

                  <Grid2>
                    <FormControl
                      sx={{ flexDirection: "row", alignItems: "center", width: "100%" }}
                      className="section-useredit__general-form"
                    >
                      <FormLabel
                        required
                        className="body1 text-onbackground font-medium"
                      >
                        Freezing Required?
                      </FormLabel>
                      <RadioGroup
                        value={data?.rcvfreezingreq}
                        sx={{ flexDirection: "row", margin: "0 1rem" }}
                        name="radio-button-group-freezing"
                      >
                        <RadioLarge
                          className="text-onbackground font-medium"
                          value="1"
                          label="Yes"
                        />
                        <RadioLarge
                          className="text-onbackground font-medium"
                          value="0"
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid2>

                  <Grid2>
                    <FormControl
                      sx={{ flexDirection: "row", alignItems: "center", width: "100%" }}
                      className="section-useredit__general-form"
                    >
                      <FormLabel
                        required
                        className="body1 text-onbackground font-medium"
                      >
                        BFHELD?
                      </FormLabel>
                      <RadioGroup
                        value={data?.rcvbfheld}
                        sx={{ flexDirection: "row", margin: "0 1rem" }}
                        name="radio-button-group-bfheld"
                      >
                        <RadioLarge
                          className="text-onbackground font-medium"
                          value="1"
                          label="Yes"
                        />
                        <RadioLarge
                          className="text-onbackground font-medium"
                          value="0"
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid2>

                  <Grid2>
                    <FormControl
                      sx={{ flexDirection: "row", alignItems: "center", width: "100%" }}
                      className="section-useredit__general-form"
                    >
                      <FormLabel
                        required
                        className="body1 text-onbackground font-medium"
                      >
                        Crypto?
                      </FormLabel>
                      <RadioGroup
                        value={data?.rcvcrypto}
                        sx={{ flexDirection: "row", margin: "0 1rem" }}
                        name="radio-button-group-crypto"
                      >
                        <RadioLarge
                          className="text-onbackground font-medium"
                          value="1"
                          label="Yes"
                        />
                        <RadioLarge
                          className="text-onbackground font-medium"
                          value="0"
                          label="No"
                        />
                      </RadioGroup>
                    </FormControl>
                  </Grid2>
                </>
              )}
            </Stack>

            {/* Bypass Box/Piece — LOC only */}
            {showLocOnlyFields && (
              <Stack flexGrow={1}>
                <Grid2>
                  <HintBox
                    className="dialog-field-width"
                    hint="Selecting this checkbox allows the user to bypass inputting BOX/PIECE information for this receiving."
                  />
                </Grid2>
                <Grid2>
                  <FormControlLabel
                    disabled={noboxDisabled}
                    key="checkbox-nobox"
                    className="text-onbackground"
                    control={
                      <CheckboxLarge
                        checked={bypassBox}
                        onChange={handleBypassBox}
                      />
                    }
                    label={"Bypass Box/Piece Information:"}
                  />
                </Grid2>
              </Stack>
            )}
          </Grid2>
        </div>

        {/* ----------------------------------------------------------------
            Section 3 — No Line Item Receiving, BASIS Prefix, Hand Delivery,
                        Do Not Send To Genesis, DVV Receiving
        ---------------------------------------------------------------- */}
        <div className="form-section">
          <Grid2 columnGap={1} columnSpacing={2} rowSpacing={1} container>
            <Stack flexGrow={1}>
              <Grid2>
                <FormControlLabel
                  disabled={nolinesDisabled}
                  title="Select No Line Item Receiving if line item information will not be entered in prior to submitting."
                  key="checkbox-nolines"
                  className="text-onbackground"
                  control={
                    <CheckboxLarge
                      checked={nolines === "1"}
                      onChange={handleChangeLines}
                    />
                  }
                  label={"No Line Item Receiving:"}
                />
              </Grid2>
              {!prefixHidden && (
                <Grid2>
                  <Autocomplete
                    className="dialog-field-width"
                    options={["item1", "item2", "item3"]}
                    value={(data?.prefixcode as string) ?? null}
                    renderInput={(params) => (
                      <StyledTextField
                        required
                        {...params}
                        variant="filled"
                        label={"BASIS Prefix"}
                        className="section-useredit__field body1 text-onbackground"
                        helperText="Select a BASIS Prefix Number"
                      />
                    )}
                    slotProps={{
                      paper: {
                        sx: {
                          "& .MuiAutocomplete-listbox": { fontSize: "1.6rem" },
                        },
                      },
                    }}
                  />
                </Grid2>
              )}
              <Grid2>
                <FormControlLabel
                  disabled={handDeliveryDisabled}
                  title="Only available for field receiving process."
                  key="checkbox-handdelivery"
                  className="text-onbackground"
                  control={
                    <CheckboxLarge
                      checked={handdelivery === "1"}
                      onChange={handleHandDelivery}
                    />
                  }
                  label={"Hand Delivery:"}
                />
              </Grid2>
              {!qtyAdjHidden && (
                <Grid2>
                  <FormControlLabel
                    disabled={qtyAdjDisabled}
                    key="checkbox-qtyadj"
                    className="text-onbackground"
                    control={
                      <CheckboxLarge
                        checked={(data?.qty_adjustment_only as string) === "1"}
                        onChange={() => {}}
                      />
                    }
                    label={"Do Not Send To Genesis:"}
                  />
                </Grid2>
              )}
            </Stack>

            <Stack flexGrow={1}>
              <Grid2>
                <FormControlLabel
                  key="checkbox-cps"
                  className="text-onbackground"
                  control={
                    <CheckboxLarge checked={cps === "1"} onChange={handleCPS} />
                  }
                  label={"DVV Receiving:"}
                  title="Select for DVV Receiving"
                  disabled={!bs.cpsReceiving}
                />
              </Grid2>
            </Stack>
          </Grid2>
        </div>

        {/* ----------------------------------------------------------------
            Section 4 — Delivered To, Receiving Remarks, Hand Delivered Date
        ---------------------------------------------------------------- */}
        <div className="form-section">
          <Grid2 columnGap={1} columnSpacing={2} rowSpacing={1} container>
            <Stack flexGrow={1}>
              <Grid2>
                <SearchField
                  label={"Delivered To"}
                  className="dialog-field-width"
                  title="Only available for field receiving process."
                  fullWidth={true}
                  value={data?.deliveryrecipient}
                  disable={!isHandDelivery}
                  required={isHandDelivery}
                />
              </Grid2>
              <Grid2>
                <CustomTextField
                  className="dialog-field-width"
                  multiline
                  minRows={4}
                  label={"Receiving Remarks"}
                  variant="filled"
                  value={(data?.remarks as string) ?? ""}
                />
              </Grid2>
            </Stack>

            <Stack flexGrow={1}>
              <Grid2>
                <MyDatePicker
                  title="Only available for field receiving process."
                  label={"Hand Delivered Date:"}
                  required={isHandDelivery}
                  value={
                    data?.deliverydate
                      ? dayjs(data.deliverydate as string)
                      : null
                  }
                  isDisabled={!isHandDelivery}
                />
              </Grid2>
            </Stack>
          </Grid2>
        </div>
      </Box>
    </>
  );
}
