"use client";
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
import { useState } from "react";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface NewReceivingFormData {
  nobox?: string;
  nolines?: string;
  handdelivery?: string;
  cps?: string;
  datein?: string;
  dateout?: string;
  pieces?: unknown;
  weight?: unknown;
  licount?: unknown;
  lilist?: unknown;
  route?: string | null;
  carrier?: string;
  packing_slip_provided?: string;
  rcvrefrigerationreq?: string;
  rcvfreezingreq?: string;
  rcvbfheld?: string;
  rcvcrypto?: string;
  prefixcode?: string | null;
  deliveryrecipient?: unknown;
  remarks?: string;
  deliverydate?: string;
  status_id?: number | null;
}

interface NewReceivingFormProps {
  data: NewReceivingFormData;
  type?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function NewReceivingForm(props: NewReceivingFormProps) {
  const [bypassBox, setBypassBox] = useState(
    props.data?.nobox === "0" ? false : true
  );
  const handleBypassBox = () => setBypassBox((prev) => !prev);

  const [nolines, setNoLines] = useState(props.data?.nolines ?? "0");
  const handleChangeLines = () => {
    let newVal: string;
    if (nolines === "0") {
      newVal = "1";
    } else {
      newVal = "0";
    }
    setNoLines(newVal);
  };

  const [handdelivery, setHandDelivery] = useState(
    props.data?.handdelivery ?? "0"
  );
  const handleHandDelivery = () =>
    setHandDelivery((prev) => {
      if (prev === "0") {
        return "1";
      }
      return "0";
    });

  const [cps, setCPS] = useState(props.data?.cps ?? "0");
  const handleCPS = () =>
    setCPS((prev) => {
      if (prev === "0") {
        return "1";
      }
      return "0";
    });

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
                  value={props.data?.datein ? dayjs(props.data.datein) : null}
                  isDisabled={true}
                />
              </Grid2>
              <Grid2>
                <MyDatePicker
                  required={true}
                  label={"Date/Time Out:"}
                  className="dialog-field-width"
                  value={props.data?.dateout ? dayjs(props.data.dateout) : null}
                  isDisabled={true}
                />
              </Grid2>
              <Grid2>
                <CustomTextField
                  className="dialog-field-width"
                  label={"Pieces"}
                  variant="filled"
                  required
                  slotprops={{ htmlInput: { maxLength: 128 } }}
                  inputProps={{ inputMode: "number" }}
                  value={props.data?.pieces}
                  disabled
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
                  slotprops={{ htmlInput: { maxLength: 128 } }}
                  inputProps={{ inputMode: "number" }}
                  value={props.data?.weight}
                  disabled
                />
              </Grid2>
            </Stack>

            <Stack flexGrow={1}>
              <Grid2>
                <CustomTextField
                  className="dialog-field-width"
                  label={"Item Count"}
                  variant="filled"
                  slotprops={{ htmlInput: { maxLength: 128 } }}
                  inputProps={{ inputMode: "number" }}
                  value={props.data?.licount}
                  disabled
                />
              </Grid2>
              <Grid2>
                <CustomTextField
                  className="dialog-field-width"
                  label={"Item List"}
                  variant="filled"
                  slotprops={{ htmlInput: { maxLength: 128 } }}
                  value={props.data?.lilist}
                  disabled
                />
              </Grid2>
              <Grid2>
                <Autocomplete
                  className="dialog-field-width"
                  options={["item1", "item2", "item3"]}
                  value={props.data?.route ?? null}
                  renderInput={(params) => (
                    <StyledTextField
                      required
                      {...params}
                      variant="filled"
                      label={"Route"}
                      className="section-useredit__field body1 text-onbackground"
                      helperText="Select a Route"
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
              <Grid2>
                <Autocomplete
                  className="dialog-field-width"
                  options={["item1", "item2", "item3"]}
                  value={props.data?.carrier ?? "SON"}
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
                        Bypass Box/Piece, No Line Item Receiving
        ---------------------------------------------------------------- */}
        <div className="form-section">
          <Grid2 columnGap={1} columnSpacing={2} rowSpacing={1} container>
            <Stack flexGrow={1}>
              <Grid2>
                <HintBox
                  className="dialog-field-width"
                  hint="Packing list may appear within 60 days of receiving."
                />
              </Grid2>

              {/* Packing List Provided? */}
              <Grid2>
                <FormControl
                  sx={{ flexDirection: "row", alignItems: "center", width: "100%" }}
                  className="section-useredit__general-form"
                  disabled
                >
                  <FormLabel
                    required
                    className="body1 text-onbackground font-medium"
                  >
                    Packing List Provided?
                  </FormLabel>
                  <RadioGroup
                    sx={{ flexDirection: "row", margin: "0 1rem" }}
                    name="radio-button-group-crypto"
                    value={props.data?.packing_slip_provided}
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

              {/* Refrigeration Required? */}
              <Grid2>
                <FormControl
                  sx={{ flexDirection: "row", alignItems: "center", width: "100%" }}
                  className="section-useredit__general-form"
                  disabled
                >
                  <FormLabel
                    required
                    className="body1 text-onbackground font-medium"
                  >
                    Refrigeration Required?
                  </FormLabel>
                  <RadioGroup
                    value={props.data?.rcvrefrigerationreq}
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

              {/* Freezing Required? */}
              <Grid2>
                <FormControl
                  sx={{ flexDirection: "row", alignItems: "center", width: "100%" }}
                  className="section-useredit__general-form"
                  disabled
                >
                  <FormLabel
                    required
                    className="body1 text-onbackground font-medium"
                  >
                    Freezing Required?
                  </FormLabel>
                  <RadioGroup
                    value={props.data?.rcvfreezingreq}
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

              {/* BFHELD? */}
              <Grid2>
                <FormControl
                  disabled
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
                    value={props.data?.rcvbfheld}
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

              {/* Crypto? */}
              <Grid2>
                <FormControl
                  disabled
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
                    value={props.data?.rcvcrypto}
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
            </Stack>

            {/* Bypass Box/Piece + No Line Item Receiving */}
            <Stack flexGrow={1}>
              <Grid2>
                <HintBox
                  className="dialog-field-width"
                  hint="Selecting this checkbox allows the user to bypass inputting BOX/PIECE information for this receving."
                />
              </Grid2>
              <Grid2>
                <FormControlLabel
                  disabled
                  key="checkbox1"
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
          </Grid2>
        </div>

        {/* ----------------------------------------------------------------
            Section 3 — No Line Item Receiving, BASIS Prefix, Hand Delivery, DVV
        ---------------------------------------------------------------- */}
        <div className="form-section">
          <Grid2 columnGap={1} columnSpacing={2} rowSpacing={1} container>
            <Stack flexGrow={1}>
              <Grid2>
                <FormControlLabel
                  title="Select No Line Item Receiving if line item information will not be entered in prior to submitting."
                  key="checkbox1"
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
              <Grid2>
                <Autocomplete
                  className="dialog-field-width"
                  options={["item1", "item2", "item3"]}
                  value={props.data?.prefixcode}
                  renderInput={(params) => (
                    <StyledTextField
                      required
                      {...params}
                      variant="filled"
                      label={"BASIS Prefix"}
                      className="section-useredit__field body1 text-onbackground"
                      helperText="Select a BASIS Prefix Number"
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
              <Grid2>
                <FormControlLabel
                  title="Only available for field receving process."
                  key="checkbox1"
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
            </Stack>

            <Stack flexGrow={1}>
              <Grid2>
                <FormControlLabel
                  key="checkbox1"
                  className="text-onbackground"
                  control={
                    <CheckboxLarge checked={cps === "1"} onChange={handleCPS} />
                  }
                  label={"DVV Receiving:"}
                  title="Select for DVV Receiving"
                  disabled={
                    !(
                      props.type === "b3" ||
                      (props.data?.status_id !== null &&
                        props.data?.status_id === 1 &&
                        props.data?.cps)
                    )
                  }
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
                  value={props.data?.deliveryrecipient}
                  disable={true}
                />
              </Grid2>
              <Grid2>
                <CustomTextField
                  className="dialog-field-width"
                  multiline
                  minRows={4}
                  label={"Receiving Remarks"}
                  variant="filled"
                  slotprops={{ htmlInput: { maxLength: 128 } }}
                  value={props.data?.remarks ?? ""}
                  disabled
                />
              </Grid2>
            </Stack>

            <Stack flexGrow={1}>
              <Grid2>
                <MyDatePicker
                  title="Only available for field receiving process."
                  label={"Hand Delivered Date:"}
                  value={
                    props.data?.deliverydate
                      ? dayjs(props.data.deliverydate)
                      : null
                  }
                  isDisabled={true}
                />
              </Grid2>
            </Stack>
          </Grid2>
        </div>
      </Box>
    </>
  );
}
