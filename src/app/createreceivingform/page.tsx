"use client";

import { Alert, Box, CircularProgress, Snackbar } from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import ReceivingTabPanel from "./ReceivingTabPanel";
import { CustomToolbar } from "@/components/CustomComponents";
import { useUserContext } from "@/app/hooks/useUserContext";
import { loadEnvironment } from "@/utils/EnvironmentUtils";
import { VALIDATION_MESSAGES } from "./receivingFormConstants";

// NOTE: CustomToolbar will be provided by CustomComponents once converted from its PDF.
// NOTE: useFetchReceivingData and useFetchReceivingForm are service hooks to be added to ServiceHooks/services.tsx.

// ---------------------------------------------------------------------------
// Temporary inline stubs — replace with real imports once companion files exist
// ---------------------------------------------------------------------------

interface ToolbarButton {
  name: string;
  handleClick: () => void;
  disabled?: boolean;
}

// interface CustomToolbarProps {
//   readOnlyData: unknown[];
//   buttons: ToolbarButton[];
//   smallButtons?: boolean;
// }

// function CustomToolbar({ buttons }: CustomToolbarProps) {
//   return (
//     <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", p: 1 }}>
//       {buttons.map((btn) => (
//         <button key={btn.name} onClick={btn.handleClick} type="button">
//           {btn.name}
//         </button>
//       ))}
//     </Box>
//   );
// }

interface ReceivingFormData {
  shippingOrderId?: number;
  poNumber?: string | null;
  son?: string | null;
  receivedDate?: Date | null;
  packageId?: number | null;
  [key: string]: unknown;
}

interface FetchDataResult {
  data: ReceivingFormData[] | null;
  loading: boolean;
}

function useFetchReceivingData(
  id: string | null,
  type: string | null,
  numberType: string | null,
): FetchDataResult {
  // TODO: replace stub with real API call via Axios
  const [data, setData] = useState<ReceivingFormData[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      // TODO: remove mock — replace with real API response
      setData([
        {
          shippingOrderId: 996753, //"RECV-00001",
          son: id ?? "09999999",
          poNumber: null,
          receivedDate: null,
          packageId: null,
          destination: "HQ Warehouse",
          type: type ?? "",
          numberType: numberType ?? "0",
          //
          refrigerationReq: true,
          receiver: null,
          freezingReq: true,
          containsWeapons: true,
          route: null,
          statusId: 2,
          referenceNumber: "999999901",
          bscDocNumber: null,
          constainshazmat: true,
          finalDestinationName: "EUROPE - 0999",
          receivedTime: null,
          lilist: null,
          status: {
            active: true,
            completed: false,
            id: 2,
            longDescription: "Submitted",
            shortDescription: "Submitted",
            submitted: true,
          },
        },
      ]);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [id, type, numberType]);

  return { data, loading };
}

interface FetchFormResult {
  formData: { data: ReceivingFormData | null } | null;
  loading: boolean;
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function toStringValue(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function toArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function hasValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return true;
}

function isTruthyFlag(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value === 1;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase();
    return (
      normalized === "1" ||
      normalized === "Y" ||
      normalized === "YES" ||
      normalized === "TRUE"
    );
  }
  return false;
}

function useFetchReceivingForm(
  recId: number | null,
  recDate: Date | null,
  son: string,
  ponum: string | null,
  packageId: number | null,
): FetchFormResult {
  // TODO: replace stub with real API call via Axios
  const [formData, setFormData] = useState<{
    data: ReceivingFormData | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!recId) return;
    const timer = setTimeout(() => {
      // TODO: remove mock — replace with real API response
      setFormData({
        data: {
          shippingOrderId: recId,
          son: "999999901",
          poNumber: ponum,
          receivedDate: recDate,
          packageId,
          destination: "HQ Warehouse",
          carrier: "Mock Carrier",
          receivingGroup: "NPR Group",
          status_id: null,
          //
          indicator: null,
          containsammo: "YES",
          final_destination: "0999",
          qty_adjustment_only: null,
          deliverydate: null,
          lineItems: [
            {
              rotating: null,
              qty_due: 100.0,
              total_qty_received: 15,
              rec_uom_desc: null,
              receiptscomplete: 0,
              linetype: " ",
              lotnum: null,
              nsn: null,
              description: "line 1",
              syscomments: "",
              assetItems: [],
              respoffcode: null,
              line_id: 3768506,
              transactiontype: " ",
              receiveddate: null,
              genesis_id: 0,
              partnum: " ",
              manufacturer: " ",
              ord_qty: 100,
              boxnum: null,
              polinecomment: " ",
              line_number: 1,
              pack_nbr: " ",
              rec_uom: null,
              orig_rec_qty: 0.0,
              conditioncode: null,
              clin: null,
              comments: " ",
              storeloc: " ",
              modelnum: " ",
              genesis_line: 0,
              binnum: null,
              enteredby: " ",
              lottype: null,
              venddeliverydate: null,
              boxItems: [],
              discrepancy: null,
              extendeddescription: " ",
              rec_qty: null,
              rl_id: null,
              disc_cargo: null,
              org_uom: "BOX",
            },
            {
              rotating: null,
              qty_due: 100.0,
              total_qty_received: 25,
              rec_uom_desc: null,
              receiptscomplete: 0,
              linetype: " ",
              lotnum: null,
              nsn: null,
              description: "line 2",
              syscomments: "",
              assetItems: [],
              respoffcode: null,
              line_id: 3768507,
              transactiontype: " ",
              receiveddate: null,
              genesis_id: 0,
              partnum: " ",
              manufacturer: " ",
              ord_qty: 100,
              boxnum: null,
              polinecomment: " ",
              line_number: 2,
              pack_nbr: " ",
              rec_uom: null,
              orig_rec_qty: 0.0,
              conditioncode: null,
              clin: null,
              comments: " ",
              storeloc: " ",
              modelnum: " ",
              genesis_line: 0,
              binnum: null,
              enteredby: " ",
              lottype: null,
              venddeliverydate: null,
              boxItems: [],
              discrepancy: null,
              extendeddescription: " ",
              rec_qty: null,
              rl_id: null,
              disc_cargo: null,
              org_uom: "BOX",
            },
          ],
          genesis: null,
          handling_priority_type_id: null,
          allow_packages: "Y",
          rcvfreezingreq: "1",
          id: null,
          tireq: "WEA",
          receivingid: null,
          refrigerationreq: "YES",
          taskreceivepieces: null,
          draftReceipts: [
            {
              receiver: "John Doe",
              sonid: 996753,
              contains_assets: "YES",
              receivedTime: "12:59",
              ref_no: "999111",
              created_station: 9,
              receiveddate: 1774238400000,
              pieces: 1,
              son: "999999901",
              route: "GT",
              boxlist: null,
              ponum: null,
              id: 1136394,
              lilsit: "1",
              receivingid: 1136394,
            },
          ],
          packing_slip_provided: null,
          sonmaxboxid: 0,
          secureshipmentreq: "NO",
          nolines: "0",
          sonid: 996753,
          datereqatdest: 1774929600000,
          cps: "0",
          rcvbfheld: "0",
          nobox: "0",
          weight: null,
          trackingNumbers: [
            {
              objid: 3616686,
              shipping_order_id: 996753,
              comments: "Test Shipping Order Number Type",
              scanned_date: null,
              reference_number: "999999901",
              reference_nbr_type_id: 1,
            },
          ],
          satellite_location: null,
          received: null,
          containscrypto: "YES",
          rcvrefrigerationreq: "1",
          receiving_completed: "0",
          taskutility: null,
          route: null,
          previousReceipts: [
            {
              receiver: "John Doe",
              sonid: 996753,
              contains_assets: "YES",
              receivedTime: "12:49",
              ref_no: "999111",
              created_station: 9,
              receiveddate: 1774238400000,
              pieces: 1,
              son: "999999901",
              route: "GT",
              boxlist: "1",
              ponum: null,
              id: 1136394,
              lilsit: "1",
              receivingid: 1136394,
            },
          ],
          containslithiumbatt: "YES",
          containsconcealmentdvc: "YES",
          boxid: 2,
          markpackship: null,
          backhaul: "0",
          purpose: null,
          licount: null,
          freezingreq: "YES",
          contiansweapons: "YES",
          taskstatusid: null,
          receiveddate: 1774272344000,
          pieces: null,
          carrier_id: null,
          esmtid: null,
          draftmaxboxid: 0,
          handdelivery: "0",
          receivedfromincomingcargo: null,
          containshazmat: "YES",
          track: null,
          genesispoid: null,
          prefixcode: null,
          lilist: null,
          shiptoname: null,
          boxAttributes: [],
          rack: null,
          address:
            "123 Town Center Drive\nCorner Avenue\nDowntown City\nCloud Willow Oaks, Room: 36\r\nJohn Doe/PhL 5551234567\r\nAB/DEFG/HIJK/LMN\r\n\r\n",
          boxIds: [1040416],
          dateout: 1774272344000,
          rtid: null,
          bscdocnumber: null,
          shiptoaresid: null,
          lptsid: null,
          taskpasckages: null,
          shiptostationid: null,
          cubiscanLocation: {
            active: true,
            cubiscanType: {
              databaseLocation: null,
              id: 11,
              longDescription: "Receiving Area",
              shortDescription: "Receiving Area",
            },
            id: 16,
            ipAddress: "1.10.20.30",
            longDescription: "Cube Rec 1",
            shortDescription: "Cube Rec 1",
          },
          ponum: null,
          son_handling_priority_type_id: null,
          assetReceivedItems: [],
          rcvcrypto: "1",
          sotypeid: 0,
          tasktypeid: null,
          remarks: null,
          deliveryrecipient: null,
          containsbfheld: "NO",
        },
      });
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [recId, recDate, son, ponum, packageId]);

  return { formData, loading };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default function ReceivingFormPage() {
  const [requestCreated, setRequestCreated] = useState(false);
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "12345678";
  const type = searchParams.get("type");
  const numberType = searchParams.get("numberType");

  const { data, loading } = useFetchReceivingData(id, type, numberType);

  const [recId, setRecId] = useState<number | null>(null);
  const [son, setSon] = useState(id);
  const [ponum, setPonum] = useState<string | null>(null);
  const [recDate, setRecDate] = useState<Date | null>(null);
  const [packageId, setPackageId] = useState<number | null>(null);

  const {
    user,
    displayName,
    isWMAUser,
    isLOCUser,
    isCurrentStationSet,
    isFranUser,
    isCurrentBuildingSet,
    isAtLocBuilding,
    isAtLocBuildingX,
    currentBuilding,
    currentStation,
    showAptic,
    printReceivingLabel,
  } = useUserContext();

  const { formData, loading: recFormLoading } = useFetchReceivingForm(
    recId,
    recDate,
    son,
    ponum,
    packageId,
  );

  const [recFormData, setRecFormData] = useState<ReceivingFormData | null>(
    null,
  );

  const handleFormDataChange = useCallback(
    (changes: Partial<Record<string, unknown>>) => {
      setRecFormData((prev) => ({ ...(prev ?? {}), ...changes }));
    },
    [],
  );

  const recFormInitialized = useRef(false);

  // Seed lookup keys from the search/receiving data
  useEffect(() => {
    if (loading || !data || data.length === 0) return;
    const d = data[0];
    if (d.shippingOrderId) setRecId(d.shippingOrderId);
    if (d.poNumber) setPonum(d.poNumber);
    if (d.son) setSon(d.son);
    if (d.receivedDate) setRecDate(d.receivedDate);
    if (d.packageId) setPackageId(d.packageId);
  }, [loading, data]);

  // Initialize recFormData exactly once from the form API
  useEffect(() => {
    if (recFormLoading || !formData?.data || recFormInitialized.current) return;
    recFormInitialized.current = true;
    setRecFormData(formData.data);
  }, [recFormLoading, formData]);

  const receivingBusinessState = useMemo(() => {
    const record = (recFormData ?? {}) as Record<string, unknown>;

    const statusId = toNumber(record.status_id);
    const sotypeId = toNumber(
      record.sotypeId ?? record.soTypeid ?? record.sotypeid,
    );
    const tasktypeId = toNumber(record.tasktypeid);
    const idValue = toNumber(record.id);
    const sonId = toNumber(record.sonid);
    const recIdValue = record.recid ?? record.receivingid;
    const recid = toNumber(recIdValue);
    const draftMaxBoxId = toNumber(record.draftmaxboxid) ?? 0;
    const sonMaxBoxId = toNumber(record.sonmaxboxid) ?? 0;
    const shipToAreaId = toNumber(record.shiptoaresid);
    const shipToStationId = toNumber(record.shiptostationid);
    const currentBuildingId = toNumber(
      (currentBuilding as { id?: unknown } | null)?.id,
    );
    const currentStationId = toNumber(currentStation?.id);

    const isNewReceiving =
      idValue === null ||
      (idValue !== null && sonId !== null && idValue === sonId) ||
      statusId === 1;

    const isWMADestination =
      (shipToAreaId !== null &&
        currentBuildingId !== null &&
        shipToAreaId === currentBuildingId) ||
      (shipToStationId !== null &&
        currentStationId !== null &&
        shipToStationId === currentStationId);

    return {
      handDelivery: toStringValue(record.handdelivery) === "1",
      bcsReceiving: type === "b1",
      cpsReceiving: type === "b3" || (statusId === 1 && hasValue(record.cps)),
      apticReceiving: showAptic && sotypeId === 1 && tasktypeId === 1,
      recid,
      allowPackages: record.allow_packages,
      isPreviousReceipt: !isNewReceiving,
      draftReceipts: toArray(record.draftReceipts).length > 1,
      previousReceipts: toArray(record.previousReceipts).length > 1,
      fromIncomingCargo:
        toStringValue(
          record.receivdfromincomingcargo ?? record.receivedfromincomingcargo,
        ) === "Y"
          ? "Yes"
          : "No",
      hhLite: !isLOCUser && !isFranUser,
      received: hasValue(recIdValue),
      draft: statusId === 1,
      boxIdOutOfSync: draftMaxBoxId > 0 && sonMaxBoxId > draftMaxBoxId,
      isBfheld: toStringValue(record.rcvbfheld) === "1",
      isCrypto: toStringValue(record.rcvcrypto) === "1",
      existingDiscrepant: toNumber(record.route) === 2,
      isWMADestination,
      locPackingRequired: isTruthyFlag(
        record.locPackingRequired ?? record.locpackingrequired,
      ),
      isNewReceiving,
      isPreviousReceiving: idValue !== null || statusId === 2,
      isApticReceiving:
        showAptic &&
        sotypeId !== null &&
        sotypeId === 1 &&
        tasktypeId !== null &&
        tasktypeId === 1,
    };
  }, [
    recFormData,
    type,
    showAptic,
    isLOCUser,
    isFranUser,
    currentBuilding,
    currentStation,
  ]);

  // ---------------------------------------------------------------------------
  // Form validity & submit gating
  // ---------------------------------------------------------------------------

  const [formValid, setFormValid] = useState(false);

  const canSubmit =
    formValid &&
    (receivingBusinessState.isNewReceiving || receivingBusinessState.draft);

  // ---------------------------------------------------------------------------
  // Save feedback (Snackbar)
  // ---------------------------------------------------------------------------

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState<"success" | "error">(
    "success",
  );

  const showSnack = useCallback(
    (message: string, severity: "success" | "error") => {
      setSnackMessage(message);
      setSnackSeverity(severity);
      setSnackOpen(true);
    },
    [],
  );

  // ---------------------------------------------------------------------------
  // advancedValidationIssues — per ReceivingForm-analysis.md Section 10
  // Runs before every non-draft submit. Returns first error or null.
  // ---------------------------------------------------------------------------

  const advancedValidationIssues = useCallback((): string | null => {
    const record = (recFormData ?? {}) as Record<string, unknown>;
    const lineItems = (record.lineItems ?? []) as any[];
    const boxAttributes = (record.boxAttributes ?? []) as any[];
    const trackingNumbers = (record.trackingNumbers ?? []) as any[];
    const pieces = Number(record.pieces) || 0;
    const nolines = String(record.nolines ?? "0");
    const nobox = String(record.nobox ?? "0");
    const bs = receivingBusinessState;

    // 1. Discrepancy properly routed
    if (bs.existingDiscrepant) {
      const hasDiscLines = lineItems.some(
        (li: any) => li.discrepancy != null && li.discrepancy !== "",
      );
      if (!hasDiscLines) return VALIDATION_MESSAGES.routeMustChange;
    }

    // 2. Discrepant lines have reason
    if (!bs.existingDiscrepant) {
      const hasDiscLines = lineItems.some(
        (li: any) => li.discrepancy != null && li.discrepancy !== "",
      );
      if (hasDiscLines) return VALIDATION_MESSAGES.missingDiscrepantReason;
    }

    // 3. Line item required
    if (nolines !== "1" && lineItems.length === 0) {
      return "At least one line item is required.";
    }

    // 4. RPGHELD/Crypto box mismatch
    const totalBoxes = boxAttributes.filter(
      (b: any) => (Number(b.boxId) || 0) > 0,
    ).length;
    if (
      (bs.isBfheld || bs.isCrypto || totalBoxes > 0) &&
      pieces !== totalBoxes
    ) {
      if (bs.isBfheld) return VALIDATION_MESSAGES.rpgheldBoxMismatch;
      if (bs.isCrypto) return VALIDATION_MESSAGES.cryptoBoxMismatch;
      return VALIDATION_MESSAGES.totalBoxMismatch;
    }

    // 5. Box attribute DIM check
    if (bs.isBfheld || bs.isCrypto) {
      const allDimsOk = boxAttributes.every(
        (b: any) =>
          Number(b.length) > 0 &&
          Number(b.width) > 0 &&
          Number(b.height) > 0 &&
          Number(b.weight) > 0,
      );
      if (!allDimsOk) {
        return bs.isBfheld
          ? VALIDATION_MESSAGES.rpgheldDimsMissing
          : VALIDATION_MESSAGES.cryptoDimsMissing;
      }
    }

    // 6-8. Box/Piece matching
    if (pieces > 0 && nobox !== "1" && nolines !== "1") {
      for (let i = 1; i <= pieces; i++) {
        const boxNum = ("00" + i).slice(-3);
        const found = lineItems.some((li: any) =>
          (li.boxItems ?? []).some((bi: any) => String(bi.boxnum) === boxNum),
        );
        if (!found) return VALIDATION_MESSAGES.boxPieceNotFound + boxNum;
      }
    }

    // 9. Line qty vs box qty mismatch
    for (const li of lineItems) {
      const recQty = Number(li.rec_qty) || 0;
      if (recQty > 0 && (li.boxItems ?? []).length > 0) {
        const boxQtySum = (li.boxItems as any[]).reduce(
          (sum: number, bi: any) => sum + (Number(bi.qty) || 0),
          0,
        );
        if (recQty !== boxQtySum) {
          return VALIDATION_MESSAGES.lineQtyMismatch + li.line_number;
        }
      }
    }

    // 10. LOT bin check
    const lotErrors: number[] = [];
    for (const li of lineItems) {
      if (
        String(li.lottype).toUpperCase() === "LOT" &&
        (Number(li.rec_qty) || 0) > 0
      ) {
        if (!li.binnum || !li.lotnum) {
          lotErrors.push(li.line_number);
        }
      }
    }
    if (lotErrors.length > 0) {
      return VALIDATION_MESSAGES.missingBinLot + lotErrors.join(", ");
    }

    // 12. Asset info missing
    for (const li of lineItems) {
      if (
        String(li.rotating).toUpperCase() === "YES" &&
        (Number(li.rec_qty) || 0) > 0
      ) {
        if (!li.assetItems || li.assetItems.length === 0) {
          return VALIDATION_MESSAGES.assetInfoMissing;
        }
      }
    }

    // 13. Previous receipt line check
    if (!bs.isNewReceiving) {
      for (const li of lineItems) {
        if (li.rl_id == null && (Number(li.rec_qty) || 0) > 0) {
          return VALIDATION_MESSAGES.lineNotPrevReceived + li.line_number;
        }
      }
    }

    // 14. Return line validation
    for (const li of lineItems) {
      if (
        String(li.transactiontype).toUpperCase() === "R" &&
        (Number(li.rec_qty) || 0) > 0
      ) {
        if (!li.respoffcode)
          return VALIDATION_MESSAGES.responsibleOfficeRequired;
      }
    }

    // 15. Blank reference number
    for (const tn of trackingNumbers) {
      if (!tn.reference_number || String(tn.reference_number).trim() === "") {
        return VALIDATION_MESSAGES.blankReferenceNumber;
      }
    }

    return null;
  }, [recFormData, receivingBusinessState]);

  // ---------------------------------------------------------------------------
  // onSave — mirrors ExtJS onSave + EditMaillocationsForm mock pattern
  // ---------------------------------------------------------------------------

  const onSave = useCallback(
    async (draft: boolean) => {
      if (!draft) {
        const validationMessage = advancedValidationIssues();
        if (validationMessage) {
          showSnack(validationMessage, "error");
          return;
        }
      }

      const payload = {
        ...recFormData,
        draft,
        isSubmitted: !draft,
        routingneeded:
          receivingBusinessState.isApticReceiving ||
          (!draft && receivingBusinessState.isNewReceiving),
      };

      try {
        const env = await loadEnvironment();
        const baseUrl = env.api?.server || "";

        if (typeof window !== "undefined") {
          console.info("[ReceivingForm] Submit payload preview", {
            draft,
            endpoint: `${baseUrl}receiving/movement`,
            payload,
          });
        }

        let responseData: {
          success: boolean;
          data?: { id: number };
          failureMessage?: string;
        };

        if (env.mock) {
          responseData = {
            success: true,
            data: { id: recId ?? Date.now() },
          };
        } else {
          const res = await fetch(`${baseUrl}receiving/movement`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          responseData = await res.json();
          responseData.success = res.ok;
        }

        if (responseData.success) {
          showSnack(
            draft
              ? "Receiving saved as draft."
              : "Your receiving has been successfully submitted.",
            "success",
          );
        } else {
          showSnack(
            responseData.failureMessage || "Save failed. Please try again.",
            "error",
          );
        }
      } catch {
        showSnack("Network error. Please try again.", "error");
      }
    },
    [
      advancedValidationIssues,
      recFormData,
      receivingBusinessState,
      recId,
      showSnack,
    ],
  );

  // ---------------------------------------------------------------------------
  // Toolbar
  // ---------------------------------------------------------------------------

  const buttons: ToolbarButton[] = [
    { name: "Submit", handleClick: () => onSave(false), disabled: !canSubmit },
    { name: "Ordered Items", handleClick: () => {} },
    { name: "Hand Receipt", handleClick: () => {} },
    { name: "Open Genesis Purchase Order", handleClick: () => {} },
    { name: "Print", handleClick: () => {} },
    { name: "Delivered To Customer", handleClick: () => {} },
    { name: "Save As Draft", handleClick: () => onSave(true) },
    { name: "View Audit Log", handleClick: () => {} },
    { name: "Cancel Record", handleClick: () => {} },
  ];

  return !recFormLoading ? (
    <Box className="pageTitle form__section">
      <Box className="pageTitle__headerBox">
        <h1>{`New Receiving- ${son} (${displayName})`}</h1>
      </Box>
      <CustomToolbar readOnlyData={[]} buttons={buttons} smallButtons={true} />
      <Box
        sx={{
          margin: "1rem 0rem",
          width: "100%",
          maxHeight: "45vh",
          overflow: "auto",
        }}
      >
        {/* <ShippingInformation /> */}
        <ReceivingTabPanel
          data={formData?.data ?? null}
          type={type}
          receivingBusinessState={receivingBusinessState}
          onFormValidityChange={setFormValid}
          onDataChange={handleFormDataChange}
        />
      </Box>
      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackOpen(false)}
          severity={snackSeverity}
          variant="filled"
        >
          {snackMessage}
        </Alert>
      </Snackbar>
    </Box>
  ) : (
    <>
      <Box sx={{ display: "flex" }}>
        <div
          style={{
            display: "flex",
            height: "70vh",
            flexGrow: "1" as unknown as number,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </div>
      </Box>
    </>
  );
}
