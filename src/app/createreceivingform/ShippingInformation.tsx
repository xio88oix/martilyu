"use client";

import { CustomTextField } from "@/components/CustomComponents";
import { Box, Typography, Stack } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import dayjs from "dayjs";
import ReferenceTrackingGridController from "./ReferenceTrackingGridController";

interface TrackingNumber {
  [key: string]: unknown;
}

// interface ReferenceTrackingGridControllerProps {
//   data: TrackingNumber[];
// }

// function ReferenceTrackingGridController({ data }: ReferenceTrackingGridControllerProps) {
//   // TODO: replace stub with real ReferenceTrackingGridController converted from ReferenceTrackingGridController.pdf
//   return (
//     <Box sx={{ p: 1 }}>
//       <p>ReferenceTrackingGridController — {data.length} row(s)</p>
//     </Box>
//   );
// }

// ---------------------------------------------------------------------------
// Data shape for the shipping information form
// ---------------------------------------------------------------------------

interface ShippingInformationData {
  son?: string | null;
  tireq?: string | null;
  datereqatdest?: string | null;
  final_destination?: string | null;
  bscdocnumber?: string | null;
  address?: string | null;
  purpose?: string | null;
  markpackship?: string | null;
  status_id?: number | null;
  cps?: string | null;
  esmtid?: string | null;
  shiptoname?: string | null;
  satellite_location?: string | null;
  handling_priority_type_id?: string | null;
  containscrypto?: string | null;
  containsweapons?: string | null;
  containsammo?: string | null;
  containsbfheld?: string | null;
  containshazmat?: string | null;
  containslithiumbatt?: string | null;
  containsconcealmentdvc?: string | null;
  refrigerationreq?: string | null;
  freezingreq?: string | null;
  receivedfromincomingcargo?: string | null;
  receivdfromincomingcargo?: string | null;
  trackingNumbers?: TrackingNumber[];
}

interface ShippingInformationProps {
  data?: ShippingInformationData | null;
  type?: string | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ShippingInformation({ data, type }: ShippingInformationProps) {
  return (
    <>
      <Box sx={{ padding: "1rem" }}>
        <div className="form__section">
          <Typography variant="h3" className="form__sub-title">
            Shipping Information
          </Typography>
          <Grid2
            width={1500}
            columnGap={1}
            columnSpacing={2}
            rowSpacing={1}
            container
          >
            <Stack flexGrow={1}>
              <Grid2>
                <CustomTextField
                  label="SON:"
                  value={data?.son}
                  disabled
                />
              </Grid2>
              <Grid2>
                <CustomTextField
                  label="T&I Required:"
                  value={data?.tireq}
                  disabled
                />
              </Grid2>
              <Grid2>
                <CustomTextField
                  label="Date Req. at Final Dest.:"
                  value={
                    data?.datereqatdest
                      ? dayjs(data.datereqatdest).format("MM/DD/YYYY")
                      : ""
                  }
                  disabled
                />
              </Grid2>
              <Grid2>
                <CustomTextField
                  label="Destination:"
                  value={data?.final_destination}
                  disabled
                />
              </Grid2>
            </Stack>
            <Stack flexGrow={1}>
              <Grid2 sx={type !== "b1" ? { display: "none" } : {}}>
                <CustomTextField
                  label="Contract #:"
                  value={data?.bscdocnumber}
                  disabled
                />
              </Grid2>
            </Stack>
          </Grid2>
        </div>

        <div className="form__section">
          <Grid2
            width={1500}
            columnGap={1}
            columnSpacing={2}
            rowSpacing={1}
            container
          >
            <Stack flexGrow={1}>
              <Grid2>
                <CustomTextField
                  label="Address:"
                  value={data?.address}
                  disabled
                />
              </Grid2>
              <Grid2>
                <CustomTextField
                  label="Purpose:"
                  value={data?.purpose}
                  disabled
                />
              </Grid2>
              <Grid2>
                <CustomTextField
                  label="Shipping & Handling Comments:"
                  value={data?.markpackship}
                  disabled
                />
              </Grid2>
            </Stack>
            <Stack flexGrow={1}>
              <Grid2
                sx={
                  !(
                    type === "b3" ||
                    (data?.status_id !== null &&
                      data?.status_id === 1 &&
                      data?.cps)
                  )
                    ? { display: "none" }
                    : {}
                }
              >
                <CustomTextField
                  label="ESMT Number:"
                  value={data?.esmtid}
                  disabled
                />
              </Grid2>
              <Grid2 sx={!data?.shiptoname ? { display: "none" } : {}}>
                <CustomTextField
                  label="Vendor Delivery Location:"
                  value={data?.shiptoname}
                  disabled
                />
              </Grid2>
              <Grid2>
                <CustomTextField
                  label="Satellite Location:"
                  value={data?.satellite_location}
                  disabled
                />
              </Grid2>
            </Stack>
          </Grid2>
        </div>

        <div className="form__section">
          <Grid2
            width={1500}
            columnGap={1}
            columnSpacing={2}
            rowSpacing={1}
            container
          >
            <Stack flexGrow={1}>
              <Grid2>
                <CustomTextField
                  label="Special Handling Requirements:"
                  value={data?.handling_priority_type_id}
                  disabled
                />
              </Grid2>
              <Grid2>
                <CustomTextField
                  label="Crypto:"
                  value={data?.containscrypto}
                  disabled
                />
              </Grid2>
              <Grid2>
                <CustomTextField
                  label="Concealment Device:"
                  value={data?.containsconcealmentdvc ?? "NO"}
                  disabled
                />
              </Grid2>
              <Grid2>
                <CustomTextField
                  label="Weapons:"
                  value={data?.containsweapons}
                  disabled
                />
              </Grid2>
              <Grid2>
                <CustomTextField
                  label="Ammo:"
                  value={data?.containsammo}
                  disabled
                />
              </Grid2>
              <Grid2>
                <CustomTextField
                  label="BFHELD:"
                  value={data?.containsbfheld}
                  disabled
                />
              </Grid2>
            </Stack>
            <Stack flexGrow={1}>
              <Grid2>
                <CustomTextField
                  label="Hazmat:"
                  value={data?.containshazmat}
                  disabled
                />
              </Grid2>
              <Grid2>
                <CustomTextField
                  label="Lithium Batteries:"
                  value={data?.containslithiumbatt}
                  disabled
                />
              </Grid2>
              <Grid2>
                <CustomTextField
                  label="Refrigeration Required:"
                  value={data?.refrigerationreq}
                  disabled
                />
              </Grid2>
              <Grid2>
                <CustomTextField
                  label="Freezing Required:"
                  value={data?.freezingreq}
                  disabled
                />
              </Grid2>
              {(data?.receivedfromincomingcargo ?? data?.receivdfromincomingcargo) === "Y" && (
                <Grid2>
                  <CustomTextField
                    label="Received From Incoming Cargo:"
                    value="Yes"
                    disabled
                  />
                </Grid2>
              )}
            </Stack>
          </Grid2>
        </div>

        <ReferenceTrackingGridController
          data={data?.trackingNumbers ?? []}
        />
      </Box>
    </>
  );
}
