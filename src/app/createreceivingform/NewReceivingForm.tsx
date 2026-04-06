"use client";
import {
  type Carrier,
  type Route,
  useFetchAllCarrier,
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
import { useEffect, useMemo, useRef, useState } from "react";
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
  onDataChange?: (changes: Partial<Record<string, unknown>>) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function NewReceivingForm(props: NewReceivingFormProps) {
  const {
    data,
    type,
    receivingBusinessState: bs,
    onFormValidityChange,
    onDataChange,
  } = props;
  const { isLOCUser, isWMAUser, isFranUser } = useUserContext();
  const { data: routeLookupData, loading: routeLookupLoading } = useFetchAllRoute();
  const { data: carrierLookupData, loading: carrierLookupLoading } = useFetchAllCarrier();

  const routeOptions = routeLookupData?.data ?? [];
  const carrierOptions = carrierLookupData?.data ?? [];
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

  const [packingSlipProvided, setPackingSlipProvided] = useState(
    (data?.packing_slip_provided as string) ?? "false"
  );
  const [refrigerationReq, setRefrigerationReq] = useState(
    (data?.rcvrefrigerationreq as string) ?? "0"
  );
  const [freezingReq, setFreezingReq] = useState(
    (data?.rcvfreezingreq as string) ?? "0"
  );
  const [bfheld, setBfheld] = useState(
    (data?.rcvbfheld as string) ?? "0"
  );
  const [crypto, setCrypto] = useState(
    (data?.rcvcrypto as string) ?? "0"
  );

  const [dateIn, setDateIn] = useState(
    data?.receiveddate ? dayjs(data.receiveddate as string) : null
  );
  const [pieces, setPieces] = useState((data?.pieces as string) ?? "");
  const [weight, setWeight] = useState((data?.weight as string) ?? "");
  const [prefixCode, setPrefixCode] = useState(
    (data?.prefixcode as string) ?? ""
  );
  const [deliveryDate, setDeliveryDate] = useState(
    data?.deliverydate ? dayjs(data.deliverydate as string) : null
  );
  const [deliveryRecipient, setDeliveryRecipient] = useState(
    (data?.deliveryrecipient as string) ?? ""
  );
  const [qtyAdjOnly, setQtyAdjOnly] = useState(
    (data?.qty_adjustment_only as string) ?? "0"
  );
  const [remarks, setRemarks] = useState((data?.remarks as string) ?? "");

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

  // Carrier — auto-select "SON" carrier on new receiving per ExtJS behavior
  const existingCarrier = useMemo(
    () => carrierOptions.find((c) => c.id === data?.carrier_id) ?? null,
    [carrierOptions, data?.carrier_id]
  );

  const defaultCarrier = useMemo(
    () => carrierOptions.find((c) => c.shortDescription.toUpperCase() === "SON") ?? null,
    [carrierOptions]
  );

  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);

  useEffect(() => {
    setSelectedCarrier(existingCarrier ?? defaultCarrier ?? null);
  }, [existingCarrier, defaultCarrier]);

  const handleCarrierChange = (_event: React.SyntheticEvent, newValue: Carrier | null) => {
    setSelectedCarrier(newValue);
  };

  const routeLabel = selectedRoute?.shortDescription ?? null;
  const isHandDelivery = handdelivery === "1";

  // ---------------------------------------------------------------------------
  // Form validity — required fields per ReceivingForm-analysis.md Section 10
  // ---------------------------------------------------------------------------

  const formValid = useMemo(() => {
    if (!pieces || Number(pieces) <= 0) return false;
    if (!weight || Number(weight) <= 0) return false;
    if (!selectedRoute) return false;
    if (isLOCUser && !packingSlipProvided) return false;
    if (handdelivery === "1") {
      if (!deliveryRecipient) return false;
      if (!deliveryDate) return false;
    }
    if (type === "b1" && !prefixCode) return false;
    return true;
  }, [pieces, weight, selectedRoute, isLOCUser, packingSlipProvided, handdelivery, deliveryRecipient, deliveryDate, type, prefixCode]);

  useEffect(() => {
    onFormValidityChange?.(formValid);
  }, [formValid, onFormValidityChange]);

  const prevDataChangeRef = useRef<string>("");

  useEffect(() => {
    const parsedPieces = pieces === "" ? null : Number(pieces);
    const parsedWeight = weight === "" ? null : Number(weight);

    const payload = {
      pieces: Number.isFinite(parsedPieces) ? parsedPieces : null,
      weight: Number.isFinite(parsedWeight) ? parsedWeight : null,
      route: selectedRoute?.id ?? null,
      carrier_id: selectedCarrier?.id ?? null,
      handdelivery,
      deliverydate: deliveryDate ? deliveryDate.valueOf() : null,
      deliveryrecipient: deliveryRecipient,
      rcvrefrigerationreq: refrigerationReq,
      rcvfreezingreq: freezingReq,
      rcvbfheld: bfheld,
      rcvcrypto: crypto,
      packing_slip_provided: packingSlipProvided,
      nobox: bypassBox ? "1" : "0",
      nolines,
      cps,
      qty_adjustment_only: qtyAdjOnly,
      prefixcode: prefixCode || null,
      remarks,
      receiveddate: dateIn ? dateIn.valueOf() : null,
    };

    const key = JSON.stringify(payload);
    if (key === prevDataChangeRef.current) return;
    prevDataChangeRef.current = key;

    onDataChange?.(payload);
  }, [
    pieces,
    weight,
    selectedRoute,
    selectedCarrier,
    handdelivery,
    deliveryDate,
    deliveryRecipient,
    refrigerationReq,
    freezingReq,
    bfheld,
    crypto,
    packingSlipProvided,
    bypassBox,
    nolines,
    cps,
    qtyAdjOnly,
    prefixCode,
    remarks,
    dateIn,
    onDataChange,
  ]);

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
                  value={dateIn}
                  onChange={(val: unknown) => setDateIn(val as typeof dateIn)}
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
                      sx={{ minWidth: 220 }}
                      label={"Total Received Pieces"}
                      variant="filled"
                      value={data?.taskreceivepieces}
                      disabled
                    />
                  </Grid2>
                  <Grid2>
                    <CustomTextField
                      sx={{ minWidth: 220 }}
                      label={"Tasking Package Pieces"}
                      variant="filled"
                      value={data?.taskpackages}
                      disabled
                    />
                  </Grid2>
                </>
              )}
              <Grid2 sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 1 }}>
                <CustomTextField
                  className="dialog-field-width"
                  label={"Pieces"}
                  variant="filled"
                  required
                  type="number"
                  inputProps={{ min: 0, step: 1 }}
                  value={pieces}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPieces(e.target.value)}
                  disabled={piecesDisabled}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (["e", "E", ".", "-", "+"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
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
                  type="number"
                  inputProps={{ min: 0, step: "any" }}
                  value={weight}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWeight(e.target.value)}
                  disabled={weightDisabled}
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (["e", "E", "-", "+"].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
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
                      helperText={!selectedRoute ? "Select a Route" : ""}
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
                  options={carrierOptions}
                  value={selectedCarrier}
                  onChange={handleCarrierChange}
                  getOptionLabel={(option) => option.shortDescription}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  loading={carrierLookupLoading}
                  renderInput={(params) => (
                    <StyledTextField
                      {...params}
                      variant="filled"
                      label={"Carrier"}
                      className="section-useredit__field body1 text-onbackground"
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
              {/* Packing List Provided? */}
              <Grid2 sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                <FormControl
                  sx={{ flexDirection: "row", alignItems: "center" }}
                  className="section-useredit__general-form"
                  disabled={packingSlipDisabled}
                >
                  <FormLabel
                    required={packingSlipRequired}
                    className="body1 text-onbackground font-medium"
                    sx={{ minWidth: 220, textAlign: "right" }}
                  >
                    Packing List Provided?
                  </FormLabel>
                  <RadioGroup
                    sx={{ flexDirection: "row", margin: "0 1rem" }}
                    name="radio-button-group-packing"
                    value={packingSlipProvided}
                    onChange={(e) => setPackingSlipProvided(e.target.value)}
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
                <HintBox
                  className="dialog-field-width"
                  hint="Packing list may appear within 60 days of receiving."
                />
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
                        sx={{ minWidth: 220, textAlign: "right" }}
                      >
                        Refrigeration Required?
                      </FormLabel>
                      <RadioGroup
                        value={refrigerationReq}
                        onChange={(e) => setRefrigerationReq(e.target.value)}
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
                        sx={{ minWidth: 220, textAlign: "right" }}
                      >
                        Freezing Required?
                      </FormLabel>
                      <RadioGroup
                        value={freezingReq}
                        onChange={(e) => setFreezingReq(e.target.value)}
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
                        sx={{ minWidth: 220, textAlign: "right" }}
                      >
                        BFHELD?
                      </FormLabel>
                      <RadioGroup
                        value={bfheld}
                        onChange={(e) => setBfheld(e.target.value)}
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
                        sx={{ minWidth: 220, textAlign: "right" }}
                      >
                        Crypto?
                      </FormLabel>
                      <RadioGroup
                        value={crypto}
                        onChange={(e) => setCrypto(e.target.value)}
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
              {!prefixHidden && (
                <Grid2>
                  <Autocomplete
                    className="dialog-field-width"
                    options={["item1", "item2", "item3"]}
                    value={prefixCode || null}
                    onChange={(_: unknown, val: string | null) =>
                      setPrefixCode(val ?? "")
                    }
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
            </Stack>

            {/* Bypass Box/Piece — LOC only */}
            {showLocOnlyFields && (
              <Stack flexGrow={1}>
                <Grid2 sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
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
                  <HintBox
                    className="dialog-field-width"
                    hint="Selecting this checkbox allows the user to bypass inputting BOX/PIECE information for this receiving."
                  />
                </Grid2>
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
                {!qtyAdjHidden && (
                  <Grid2>
                    <FormControlLabel
                      disabled={qtyAdjDisabled}
                      key="checkbox-qtyadj"
                      className="text-onbackground"
                      control={
                        <CheckboxLarge
                          checked={qtyAdjOnly === "1"}
                          onChange={() => setQtyAdjOnly((prev) => (prev === "0" ? "1" : "0"))}
                        />
                      }
                      label={"Do Not Send To Genesis:"}
                    />
                  </Grid2>
                )}
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
                <Grid2>
                  <MyDatePicker
                    title="Only available for field receiving process."
                    label={"Hand Delivered Date:"}
                    className="dialog-field-width"
                    required={isHandDelivery}
                    value={deliveryDate}
                    onChange={(val: unknown) => setDeliveryDate(val as typeof deliveryDate)}
                    isDisabled={!isHandDelivery}
                  />
                </Grid2>
                <Grid2>
                  <SearchField
                    label={"Delivered To"}
                    className="dialog-field-width"
                    title="Only available for field receiving process."
                    fullWidth={true}
                    value={deliveryRecipient}
                    handleChange={(e: unknown) => setDeliveryRecipient((e as React.ChangeEvent<HTMLInputElement>).target.value)}
                    disable={!isHandDelivery}
                    required={isHandDelivery}
                  />
                </Grid2>
              </Stack>
            )}
          </Grid2>
        </div>

        {/* ----------------------------------------------------------------
            Section 4 — Receiving Remarks
        ---------------------------------------------------------------- */}
        <div className="form-section">
          <CustomTextField
            multiline
            minRows={4}
            label={"Receiving Remarks"}
            variant="filled"
            fullWidth
            value={remarks}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRemarks(e.target.value)}
          />
        </div>
      </Box>
    </>
  );
}
