"use client";
/**
 * ReceivingFormController
 *
 * Orchestrates the full Receiving Form lifecycle.  Ported from:
 *   Hammerhead.view.receiving.ReceivingForm (ExtJS, 42-page PDF source)
 *
 * Responsibilities:
 *  - Derives all boolean flags from the incoming record (received, draft,
 *    locUser, apticReceiving, cpsReceiving, etc.)
 *  - Runs the mark-pack-ship banner logic on mount
 *  - Exposes all action handlers (onSave, cancelRecord, onHandDelivery,
 *    onNoLineItemChange, onLineItemUpdate, onBackhaul, etc.)
 *  - Runs advancedValidationIssues() before every submit
 *  - Calls parseLambdaDateTime() for the mobility tracking number callback
 *
 * This component is intentionally "headless" — it owns state and handlers
 * but delegates rendering to the child section components already in this
 * directory (ShippingInformation, NewReceivingForm, ReferenceTrackingGrid,
 * LineItemsGrid, BoxAttributesGrid, PreviousReceiptsGrid, DraftReceiptsGrid).
 *
 * Usage:
 *   <ReceivingFormController rec={receivingRecord} type="b1" editable={true} />
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  ButtonGroup,
  Divider,
  Menu,
  MenuItem,
  Snackbar,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import ShippingInformation from "./ShippingInformation";
import NewReceivingForm from "./NewReceivingForm";
import ReferenceTrackingGridController from "./ReferenceTrackingGridController";
import LineItemsGridController from "./LineItemsGridController";
import BoxAttributesGridController from "./BoxAttributesGridController";
import PreviousReceiptsController from "./PreviousReceiptsController";
import DraftReceiptsController from "./DraftReceiptsController";

import {
  INTERNAL_ROUTE,
  MARK_PACK_SHIP_MESSAGES,
  TOOLBAR_ACTIONS,
  VALIDATION_MESSAGES,
} from "./receivingFormConstants";

import type {
  BoxAttribute,
  LineItem,
  ReceivingFormState,
  ReceivingRecord,
  ReceivingSubmitPayload,
  ReceivingType,
  SaveReceivingResponse,
  TrackingLookupResult,
  TrackingNumberPayload,
} from "./receivingFormTypes";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ReceivingFormControllerProps {
  /** The fully-hydrated receiving record from the server. */
  rec: ReceivingRecord;
  /** Receiving type discriminator — drives field visibility and print logic. */
  type: ReceivingType;
  /** When false the form renders in read-only (receipt) mode. */
  editable: boolean;
  /** Base API URL — replaces Hammerhead.data.BASE_URL. */
  baseUrl?: string;
  /** Called after a successful submit (non-draft). */
  onViewReceiving?: (params: {
    id: number;
    son: string;
    type: ReceivingType;
  }) => void;
  /** Called after a successful cancel. */
  onCancelComplete?: () => void;
}

// ---------------------------------------------------------------------------
// Helpers (ported from ExtJS methods)
// ---------------------------------------------------------------------------

/**
 * Derives the special-handling banner message from the record.
 * Mirrors the if/else-if chain in initComponent (pages 3–4 of the PDF).
 */
function deriveMarkPackShipMsg(rec: ReceivingRecord): {
  msg: string | null;
  cls: string;
} {
  if (rec.tireq === "WEA") {
    return { msg: MARK_PACK_SHIP_MESSAGES[0].message, cls: "markpackship-red" };
  }
  if (rec.refrigerationreq === "YES" || rec.freezingreq === "YES") {
    return {
      msg: MARK_PACK_SHIP_MESSAGES[1].message,
      cls: "markpackship-blue",
    };
  }
  if (rec.containshazmat === "YES") {
    return {
      msg: MARK_PACK_SHIP_MESSAGES[2].message,
      cls: "markpackship-yellow",
    };
  }
  if (rec.containsbfheld === "YES") {
    return { msg: MARK_PACK_SHIP_MESSAGES[3].message, cls: "" };
  }
  if (rec.containscrypto === "YES") {
    return { msg: MARK_PACK_SHIP_MESSAGES[4].message, cls: "" };
  }
  if (rec.secureshipmentreq === "YES") {
    return {
      msg: MARK_PACK_SHIP_MESSAGES[5].message,
      cls: "markpackship-green",
    };
  }
  return { msg: null, cls: "" };
}

/**
 * Determines whether this is a new (not-yet-received) record.
 * Mirrors isNewReceiving() (page 17).
 */
function isNewReceiving(rec: ReceivingRecord): boolean {
  return (
    rec.id === null ||
    rec.id === rec.sonid ||
    (rec.status_id !== null && rec.status_id === 1)
  );
}

/**
 * Determines whether this is a previously-received record.
 * Mirrors isPreviousReceiving() (page 17).
 */
function isPreviousReceiving(rec: ReceivingRecord): boolean {
  return rec.id !== null && (rec.status_id === null || rec.status_id === 2);
}

/**
 * Parses a date string + time string from the Lambda tracking service into a
 * Date object.  Mirrors parseLambdaDateTime() (pages 39–40).
 *
 * Accepts formats:  "m/d/Y h:i A"  or  "m/d/Y H:i"  (12-hour and 24-hour).
 */
export function parseLambdaDateTime(
  dateStr: string,
  timeStr: string,
): Date | null {
  if (!dateStr || !timeStr) return null;

  const combined = `${dateStr} ${timeStr}`.trim();

  // Try native parse first (mobility passes the correct format already)
  const fast = new Date(combined);
  if (!isNaN(fast.getTime())) return fast;

  // Manual parse: m/d/Y or m-d-Y + H:i + optional AM/PM
  const re =
    /^\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\s+(\d{1,2}):(\d{1,2})(?:\s*([AaPp][Mm]))?\s*$/;
  const m = re.exec(combined);
  if (!m) return null;

  let month = parseInt(m[1], 10);
  const day = parseInt(m[2], 10);
  let year = parseInt(m[3], 10);
  let hour = parseInt(m[4], 10);
  const minute = parseInt(m[5], 10);
  const ampm = m[6] ? m[6].toUpperCase() : null;

  if (year < 100) year += 2000;
  if (ampm === "AM" && hour === 12) hour = 0;
  else if (ampm === "PM" && hour < 12) hour += 12;

  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  )
    return null;

  const d = new Date(year, month - 1, day, hour, minute, 0, 0);
  // Rollover check
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month - 1 ||
    d.getDate() !== day ||
    d.getHours() !== hour ||
    d.getMinutes() !== minute
  )
    return null;

  return d;
}

/**
 * Validates that every BoxAttribute row has non-zero dims and weight.
 * Mirrors checkBoxAttributes() (page 38).
 */
function checkBoxAttributes(attrs: BoxAttribute[]): boolean {
  return attrs.every(
    (g) =>
      g !== null && g.length > 0 && g.width > 0 && g.height > 0 && g.weight > 0,
  );
}

/**
 * Validates that every reference number row has a non-empty referenceNumber.
 * Mirrors checkEmptyReferenceNumber() (page 37).
 */
function checkEmptyReferenceNumber(
  rows: Array<{ referenceNumber?: string } | null>,
): boolean {
  for (const g of rows) {
    if (
      g !== null &&
      (!g.referenceNumber || g.referenceNumber.trim().length === 0)
    ) {
      return false;
    }
  }
  return true;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ReceivingFormController({
  rec,
  type,
  editable,
  baseUrl = "",
  onViewReceiving,
  onCancelComplete,
}: ReceivingFormControllerProps) {
  // -------------------------------------------------------------------------
  // Derive initial state from record (mirrors initComponent, pages 1–3)
  // -------------------------------------------------------------------------

  const initialState = useMemo<ReceivingFormState>(() => {
    const received = !isNewReceiving(rec);
    const draft = rec.status_id !== null && rec.status_id === 1;
    const bcsReceiving = type === "b1";
    const cpsReceiving =
      type === "b3" ||
      (rec.status_id !== null && rec.status_id === 1 && !!rec.cps);
    const apticReceiving =
      !!rec.sotypeid &&
      rec.sotypeid === 1 &&
      !!rec.tasktypeid &&
      rec.tasktypeid === 1;
    const boxIdOutOfSync =
      (rec.draftmaxboxid !== null ? rec.draftmaxboxid : 0) > 0 &&
      (rec.sonmaxboxid !== null ? rec.sonmaxboxid : 0) >
        (rec.draftmaxboxid !== null ? rec.draftmaxboxid : 0);
    const isBfheld =
      rec.rcvbfheld_display !== null && rec.rcvbfheld_display === "1";
    const isCrypto =
      rec.rcvcrypto_display !== null && rec.rcvcrypto_display === "1";
    const existingDiscrepant = rec.route === INTERNAL_ROUTE.DISCREPANT;
    const fromIncomingCargo =
      rec.receivedfromincominggcargo === null
        ? null
        : rec.receivedfromincominggcargo === "Y"
          ? "Yes"
          : "No";

    const { msg: markPackShipMsg, cls: markPackShipCls } =
      deriveMarkPackShipMsg(rec);

    return {
      received,
      draft,
      isPreviousReceipt: isPreviousReceiving(rec),
      // NOTE: locUser / wmaUser / isAtLocBuilding would come from a user
      // context hook in the real app — defaulting to false here.
      locUser: false,
      wmaUser: false,
      isAtLocBuilding: false,
      isAtLocBuildingD: false,
      bcsReceiving,
      cpsReceiving,
      apticReceiving,
      boxIdOutOfSync,
      isBfheld,
      isCrypto,
      existingDiscrepant,
      fromIncomingCargo,
      printPLLabel: false,
      markPackShipCls,
      markPackShipMsg,
    };
  }, [rec, type]);

  const [formState, setFormState] = useState<ReceivingFormState>(initialState);

  // Active tab index
  const [activeTab, setActiveTab] = useState(0);

  // Controlled form field values that drive the Receiving Information section
  const [pieces, setPieces] = useState<number | null>(rec.pieces);
  const [weight, setWeight] = useState<number | null>(rec.weight);
  const [route, setRoute] = useState<string | null>(rec.route);
  const [carrierId, setCarrierId] = useState<number | null>(rec.carrier_id);
  const [nolines, setNolines] = useState<"0" | "1">(rec.nolines);
  const [nobox, setNobox] = useState<"0" | "1">(rec.nobox);
  const [packingSlipProvided, setPackingSlipProvided] = useState(
    rec.packing_slip_provided,
  );
  const [handdelivery, setHanddelivery] = useState(rec.handdelivery);
  const [deliveryrecipient, setDeliveryrecipient] = useState(
    rec.deliveryrecipient,
  );
  const [deliverydate, setDeliverydate] = useState(rec.deliverydate);
  const [cps, setCps] = useState(rec.cps);
  const [remarks, setRemarks] = useState(rec.remarks ?? "");
  const [rcvrefrigerationreq, setRcvrefrigerationreq] = useState(
    rec.rcvrefrigerationreq,
  );
  const [rcvfreezingreq, setRcvfreezingreq] = useState(rec.rcvfreezingreq);
  const [rcvbfheld, setRcvbfheld] = useState(rec.rcvbfheld);
  const [rcvcrypto, setRcvcrypto] = useState(rec.rcvcrypto);
  const [prefixcode, setPrefixcode] = useState(rec.prefixcode);
  const [qtyAdjustmentOnly, setQtyAdjustmentOnly] = useState(
    rec.qty_adjustment_only,
  );
  const [backhaul, setBackhaul] = useState(rec.backhaul);
  const [frommos, setFrommos] = useState(rec.frommos);

  // Line items & box attributes — held by child grids but mirrored here for
  // validation.  In a real implementation these would come from Redux slices.
  const [lineItems, setLineItems] = useState<LineItem[]>(rec.lineItems ?? []);
  const [boxAttributes, setBoxAttributes] = useState<BoxAttribute[]>(
    rec.boxAttributesIn ?? [],
  );

  // Snackbar / alert state
  const [alertMsg, setAlertMsg] = useState<string | null>(null);
  const [alertSeverity, setAlertSeverity] = useState<
    "error" | "warning" | "info" | "success"
  >("info");

  // Print menu anchor
  const [printMenuAnchor, setPrintMenuAnchor] = useState<null | HTMLElement>(
    null,
  );

  // -------------------------------------------------------------------------
  // Notification alerts (mirrors notifyUser* methods, pages 16–19)
  // -------------------------------------------------------------------------

  const showAlert = useCallback(
    (
      message: string,
      severity: "error" | "warning" | "info" | "success" = "info",
    ) => {
      setAlertMsg(message);
      setAlertSeverity(severity);
    },
    [],
  );

  useEffect(() => {
    // Notify user of special handling on mount (mirrors initComponent, p.16)
    if (formState.markPackShipMsg) {
      showAlert(formState.markPackShipMsg, "warning");
    }
    // Notify of accountable property
    if (rec.containsaccountableproperty) {
      showAlert("Contains Accountable Property", "warning");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // -------------------------------------------------------------------------
  // Hand delivery handler (mirrors onHandDelivery, page 28)
  // -------------------------------------------------------------------------

  const handleHandDeliveryChange = useCallback((newValue: "0" | "1") => {
    setHanddelivery(newValue);
    const isHandDelivery = newValue === "1";
    if (!isHandDelivery) {
      setDeliverydate(null);
      setDeliveryrecipient(null);
    }
  }, []);

  // -------------------------------------------------------------------------
  // No-line-item receiving handler (mirrors onNoLineItemChange, page 23)
  // -------------------------------------------------------------------------

  const handleNoLineItemChange = useCallback((checked: boolean) => {
    setNolines(checked ? "1" : "0");
  }, []);

  // -------------------------------------------------------------------------
  // Backhaul handler (mirrors onBackhaul, page 28)
  // -------------------------------------------------------------------------

  const handleBackhaulChange = useCallback((newValue: "0" | "1") => {
    setBackhaul(newValue);
    if (newValue === "0") {
      setFrommos(null);
    }
  }, []);

  // -------------------------------------------------------------------------
  // Line item update callback (mirrors onLineItemUpdate, page 23)
  // -------------------------------------------------------------------------

  const handleLineItemUpdate = useCallback(
    (updatedItems: LineItem[], isDiscrepant: boolean) => {
      setLineItems(updatedItems);
      if (isDiscrepant) {
        setRoute(INTERNAL_ROUTE.DISCREPANT);
      }
    },
    [],
  );

  // -------------------------------------------------------------------------
  // Advanced validation (mirrors advancedValidationIssues, pages 24–27)
  // -------------------------------------------------------------------------

  const advancedValidationIssues = useCallback((): string | null => {
    const piececount = pieces ?? 0;
    const boxid = rec.receivingid ?? 1;

    const isRcvBfheld = rcvbfheld === "YES";
    const isRcvCrypto = rcvcrypto === "YES";
    const isRoutePSC = route === INTERNAL_ROUTE.PSB;
    const validateBfheld = isRcvBfheld && isRoutePSC;
    const validateCrypto = isRcvCrypto && isRoutePSC;

    // Route must change to resolve discrepancy
    if (formState.existingDiscrepant && route === INTERNAL_ROUTE.DISCREPANT) {
      // Check that the submission actually contains discrepancy lines
      const anyDiscrepancyLines = lineItems.some(
        (li) => li.disc_cargo !== null && li.disc_cargo !== "",
      );
      if (!anyDiscrepancyLines) {
        return VALIDATION_MESSAGES.routeMustChange;
      }
    }

    if (
      lineItems.some((li) => li.disc_cargo !== null && li.disc_cargo !== "") &&
      route !== INTERNAL_ROUTE.DISCREPANT
    ) {
      return VALIDATION_MESSAGES.missingDiscrepantReason;
    }

    // Line item existence check
    const hasLineItems = lineItems.length > 0;
    const isNoLineItem = nolines === "1";

    if (!hasLineItems && !isNoLineItem) {
      return ""; // grid provides its own message
    }

    // Box/piece mismatch
    if (!isNoLineItem && piececount > 0 && nobox !== "1") {
      for (let i = boxid; i < piececount + boxid; i++) {
        const bi = ("00" + i).slice(-3);
        let found = 0;
        lineItems.forEach((rec) => {
          rec.boxItems.forEach((bItem) => {
            if (bItem.boxnum === bi || bItem.boxnum === String(i)) {
              found++;
            }
          });
        });
        if (found === 0) {
          return VALIDATION_MESSAGES.boxPieceNotFound + bi;
        }
      }
    }

    // Asset validation (rotating lines)
    if (!isNoLineItem && piececount > 0 && cps === "1") {
      let errorAssetCount = 0;
      lineItems.forEach((li) => {
        if (
          li.rec_qty !== null &&
          li.rec_qty > 0 &&
          (li.rotating as string) === "Yes" &&
          !(li.genesis_id !== null && li.genesis_id > 0)
        ) {
          const checkAssetCount = li.assetItems.filter(
            (a) => a.serialnum !== null && a.serialnum !== "",
          ).length;
          if (checkAssetCount !== li.rec_qty) {
            errorAssetCount++;
          }
        }
      });
      if (errorAssetCount > 0) {
        return VALIDATION_MESSAGES.assetInfoMissing;
      }
    }

    // Box attribute validation for RPGHELD / Crypto
    const totalBoxes = boxAttributes.reduce(
      (sum, b) => sum + (b.boxId > 0 ? 1 : 0),
      0,
    );
    if (
      (validateBfheld ||
        validateCrypto ||
        (totalBoxes !== null && totalBoxes > 0)) &&
      pieces !== null &&
      pieces !== (totalBoxes ?? 0)
    ) {
      if (validateBfheld) return VALIDATION_MESSAGES.rpgheldBoxMismatch;
      if (validateCrypto) return VALIDATION_MESSAGES.cryptoBoxMismatch;
      return VALIDATION_MESSAGES.totalBoxMismatch;
    }

    if (
      (validateBfheld || validateCrypto) &&
      !checkBoxAttributes(boxAttributes)
    ) {
      return validateBfheld
        ? VALIDATION_MESSAGES.rpgheldDimsMissing
        : VALIDATION_MESSAGES.cryptoDimsMissing;
    }

    // Missing bin/lot check
    const missingBins: string[] = [];
    lineItems.forEach((li) => {
      if (
        li.linetype === "LOT" &&
        (!li.binnum || li.binnum === "") &&
        (!li.lotnum || li.lotnum === "")
      ) {
        missingBins.push(String(li.line_number));
      }
    });
    if (missingBins.length > 0) {
      return VALIDATION_MESSAGES.missingBinLot + missingBins.join(", ") + "].";
    }

    return null;
  }, [
    pieces,
    rec.receivingid,
    rcvbfheld,
    rcvcrypto,
    route,
    formState.existingDiscrepant,
    lineItems,
    nolines,
    nobox,
    cps,
    boxAttributes,
  ]);

  // -------------------------------------------------------------------------
  // Save / submit (mirrors onSave, pages 28–30)
  // -------------------------------------------------------------------------

  const onSave = useCallback(
    async (openHandReceipt: boolean, draft: boolean) => {
      if (!draft) {
        const validationMessage = advancedValidationIssues();
        if (validationMessage !== null && validationMessage !== "") {
          showAlert(validationMessage, "error");
          return;
        }
      }

      const trackingNumbers: TrackingNumberPayload[] = rec.referenceNumbers.map(
        (r) => ({
          id: r.id,
          reference_number: r.referenceNumber,
          comments: r.comments,
          reference_nbr_type_id: r.referenceNumberType?.id ?? null,
          scanned_date: r.scannedDate,
        }),
      );

      const boxAttributePayload = boxAttributes.map((r) => ({
        id: r.id,
        boxId: r.boxId > 0 ? r.boxId : 0,
        boxType: r.boxType || " ",
        length: r.length > 0 ? r.length : 0,
        width: r.width > 0 ? r.width : 0,
        height: r.height > 0 ? r.height : 0,
        weight: r.weight > 0 ? r.weight : 0,
      }));

      const payload: ReceivingSubmitPayload = {
        ...rec,
        pieces,
        weight,
        route,
        carrier_id: carrierId,
        nolines,
        nobox,
        packing_slip_provided: packingSlipProvided,
        handdelivery,
        deliveryrecipient,
        deliverydate,
        cps: type === "b3" ? "1" : cps === "1" ? "1" : "0",
        qty_adjustment_only: qtyAdjustmentOnly,
        remarks,
        rcvrefrigerationreq,
        rcvfreezingreq,
        rcvbfheld,
        rcvcrypto,
        prefixcode,
        backhaul,
        frommos,
        draft,
        routingneeded:
          formState.apticReceiving || (!draft && isNewReceiving(rec)),
        isSubmitted: !openHandReceipt && !draft,
        trackingNumbers,
        boxAttributes: boxAttributePayload,
        lines: lineItems,
      };

      try {
        const res = await fetch(`${baseUrl}receiving/movement`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data: SaveReceivingResponse = await res.json();

        if (data.success) {
          if (draft) {
            showAlert("Receiving saved as draft.", "success");
          } else {
            showAlert(
              "Your receiving has been successfully submitted.",
              "success",
            );
            if (onViewReceiving && data.responseObject.id) {
              setTimeout(() => {
                onViewReceiving({
                  id: rec.sonid,
                  son: rec.son,
                  type,
                });
              }, 1500);
            }
          }
        } else {
          showAlert("Save failed. Please try again.", "error");
        }
      } catch {
        showAlert("Network error. Please try again.", "error");
      }
    },
    [
      advancedValidationIssues,
      baseUrl,
      backhaul,
      boxAttributes,
      carrierId,
      cps,
      deliverydate,
      deliveryrecipient,
      formState.apticReceiving,
      frommos,
      handdelivery,
      lineItems,
      nobox,
      nolines,
      onViewReceiving,
      packingSlipProvided,
      pieces,
      prefixcode,
      qtyAdjustmentOnly,
      rcvbfheld,
      rcvcrypto,
      rcvfreezingreq,
      rcvrefrigerationreq,
      rec,
      remarks,
      route,
      showAlert,
      type,
      weight,
    ],
  );

  // -------------------------------------------------------------------------
  // Cancel record (mirrors cancelRecord, pages 35–36)
  // -------------------------------------------------------------------------

  const handleCancelRecord = useCallback(async () => {
    const id = rec.draft && rec.receivingid !== null ? rec.receivingid : rec.id;

    const comment = window.prompt(
      "Cancel Receiving Request - Comment Required\nPlease enter a reason for cancelling:",
    );
    if (comment === null) return; // user dismissed prompt

    const confirmed = window.confirm("Are you sure you want to continue?");
    if (!confirmed) return;

    try {
      const res = await fetch(
        `${baseUrl}receiving/movements/delete?recId=${id}&comment=${encodeURIComponent(comment)}`,
        { method: "GET" },
      );
      const data = await res.json();
      if (data.success) {
        showAlert("Record cancelled successfully.", "success");
        setTimeout(() => onCancelComplete?.(), 1000);
      } else {
        showAlert(data.errorDescription || "Unable to cancel record", "error");
      }
    } catch {
      showAlert("Network error while cancelling. Please try again.", "error");
    }
  }, [baseUrl, onCancelComplete, rec, showAlert]);

  // -------------------------------------------------------------------------
  // Tracking number mobility callback (mirrors createMb / onReferenceNumberEntered)
  // -------------------------------------------------------------------------

  const handleReferenceNumberEntered = useCallback(
    async (refNum: string) => {
      try {
        const res = await fetch(
          `${baseUrl}receiving/tracking/${encodeURIComponent(refNum)}`,
        );
        if (!res.ok) {
          showAlert("Could not fetch tracking information", "error");
          return;
        }
        const result: TrackingLookupResult = await res.json();
        if (result.error) {
          showAlert(
            result.error || result.message || "Error from server",
            "error",
          );
          return;
        }
        const dateObj = parseLambdaDateTime(result.date, result.time);
        if (!dateObj || isNaN(dateObj.getTime())) {
          showAlert("Invalid Date/Time returned from tracking server", "error");
          return;
        }
        // Update receiveddate only if the parsed date is earlier than the
        // current value (mirrors the rd.setValue logic on page 39)
        // In a real app this would dispatch to Redux or call a ref on the
        // date picker child component.
      } catch {
        showAlert("Network error while checking tracking number.", "error");
      }
    },
    [baseUrl, showAlert],
  );

  // -------------------------------------------------------------------------
  // Derive form title (mirrors me.title logic, page 3)
  // -------------------------------------------------------------------------

  const formTitle = useMemo(() => {
    if (editable) {
      return formState.isPreviousReceipt
        ? `Edit Receipt - ${rec.son}`
        : `New Receiving - ${rec.son}`;
    }
    return `Receipt - ${rec.son}`;
  }, [editable, formState.isPreviousReceipt, rec.son]);

  // -------------------------------------------------------------------------
  // Toolbar rendering
  // -------------------------------------------------------------------------

  const renderToolbar = () => {
    if (!editable) {
      // Receipt bar (view-mode) — "Go To..." button only
      return (
        <Box
          sx={{
            display: "flex",
            gap: 1,
            p: 1,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button variant="outlined" size="small">
            Go To... SON
          </Button>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          p: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Button
          variant="contained"
          size="small"
          onClick={() => onSave(false, false)}
        >
          {TOOLBAR_ACTIONS.SUBMIT.text}
        </Button>

        <Button
          variant="outlined"
          size="small"
          disabled={formState.locUser || !rec.receivingid || !rec.handdelivery}
          onClick={() => onSave(true, false)}
        >
          {TOOLBAR_ACTIONS.HAND_RECEIPT.text}
        </Button>

        <Button
          variant="outlined"
          size="small"
          disabled={!rec.ponum}
          onClick={() => {
            // mirrors onOrderedItems — opens ordered items window
          }}
        >
          {TOOLBAR_ACTIONS.ORDERED_ITEMS.text}
        </Button>

        {/* Print menu */}
        <Button
          variant="outlined"
          size="small"
          disabled={formState.received === false && !rec.receivingid}
          onClick={(e) => setPrintMenuAnchor(e.currentTarget)}
        >
          {TOOLBAR_ACTIONS.PRINT.text}
        </Button>
        <Menu
          anchorEl={printMenuAnchor}
          open={Boolean(printMenuAnchor)}
          onClose={() => setPrintMenuAnchor(null)}
        >
          <MenuItem onClick={() => setPrintMenuAnchor(null)}>
            {TOOLBAR_ACTIONS.PRINT_RECEIVING_LABEL.text}
          </MenuItem>
          <MenuItem
            disabled={type !== "b3"}
            onClick={() => setPrintMenuAnchor(null)}
          >
            {TOOLBAR_ACTIONS.PRINT_DVV_LABEL.text}
          </MenuItem>
          <MenuItem onClick={() => setPrintMenuAnchor(null)}>
            {TOOLBAR_ACTIONS.PRINT_PACKAGE_LABEL.text}
          </MenuItem>
          <MenuItem
            disabled={formState.locUser}
            onClick={() => setPrintMenuAnchor(null)}
          >
            {TOOLBAR_ACTIONS.PRINT_PACKING_LIST.text}
          </MenuItem>
          <MenuItem
            disabled={formState.locUser}
            onClick={() => setPrintMenuAnchor(null)}
          >
            {TOOLBAR_ACTIONS.PRINT_ROUTING_SLIP.text}
          </MenuItem>
          <MenuItem onClick={() => setPrintMenuAnchor(null)}>
            {TOOLBAR_ACTIONS.PRINT_THIS_RECORD.text}
          </MenuItem>
        </Menu>

        <Button
          variant="outlined"
          size="small"
          disabled={
            route !== INTERNAL_ROUTE.CUSTOMER_PICKUP &&
            route !== INTERNAL_ROUTE.LOCAL_ONLY &&
            route !== INTERNAL_ROUTE.LOCAL_DELIVERY
          }
          onClick={() => {
            // mirrors confirmDelivery
          }}
        >
          {TOOLBAR_ACTIONS.DELIVERED_TO_CUSTOMER.text}
        </Button>

        <Button
          variant="outlined"
          size="small"
          disabled={
            (formState.received && !formState.draft) ||
            !formState.locUser ||
            formState.apticReceiving
          }
          onClick={() => onSave(false, true)}
        >
          {TOOLBAR_ACTIONS.SAVE_AS_DRAFT.text}
        </Button>

        <Button
          variant="outlined"
          size="small"
          disabled={!rec.id}
          onClick={() => {
            // mirrors opening AuditLogWindow
          }}
        >
          {TOOLBAR_ACTIONS.VIEW_AUDIT_LOG.text}
        </Button>

        <Divider orientation="vertical" flexItem />

        {!formState.locUser && (
          <Button
            variant="outlined"
            size="small"
            color="error"
            disabled={
              (rec.genesispoid !== null &&
                (formState.isPreviousReceipt ||
                  (rec.status_id !== null && rec.status_id !== 1))) ||
              formState.fromIncomingCargo === "Yes"
            }
            onClick={handleCancelRecord}
          >
            {TOOLBAR_ACTIONS.CANCEL_RECORD.text}
          </Button>
        )}
      </Box>
    );
  };

  // -------------------------------------------------------------------------
  // Tab panel content
  // -------------------------------------------------------------------------

  const newReceivingTabLabel = formState.isPreviousReceipt
    ? "Receiving"
    : "New Receiving";

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <Box sx={{ width: "100%" }}>
      {/* Mark-pack-ship special handling banner */}
      {formState.markPackShipMsg && (
        <Alert
          severity="warning"
          sx={{ mb: 1 }}
          onClose={() => setFormState((s) => ({ ...s, markPackShipMsg: null }))}
        >
          {formState.markPackShipMsg}
        </Alert>
      )}

      {/* Form title */}
      <Typography variant="h2" sx={{ px: 2, py: 1 }}>
        {formTitle}
      </Typography>

      {/* Toolbar */}
      {renderToolbar()}

      {/* Shipping Information fieldset (always visible, read-only) */}
      <Box sx={{ px: 2, pt: 2 }}>
        <ShippingInformation data={rec} type={type} />
      </Box>

      {/* Reference / Tracking Numbers fieldset */}
      <Box sx={{ px: 2, pt: 1 }}>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ReferenceTrackingGridController
          data={rec.referenceNumbers ?? []}
          {...({
            editable,
            onReferenceNumberEntered: handleReferenceNumberEntered,
          } as any)}
        />
      </Box>

      {/* Tab panel */}
      <Box sx={{ px: 2, pt: 1 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          <Tab label={newReceivingTabLabel} />
          {!formState.isPreviousReceipt && <Tab label="Previous Receipts" />}
          {!formState.isPreviousReceipt && formState.draft && (
            <Tab label="Draft Receipts" />
          )}
          {formState.isPreviousReceipt && <Tab label="Processed Files" />}
          <Tab label="Logs & Comments" />
        </Tabs>

        {/* Tab 0 — Receiving Information */}
        {activeTab === 0 && (
          <Box sx={{ pt: 2 }}>
            {/* Receiving Information section */}
            <NewReceivingForm
              data={{
                nobox: rec.nobox,
                nolines,
                handdelivery,
                cps: cps ?? "0",
                datein: rec.receiveddate ?? undefined,
                dateout: rec.dateout ?? undefined,
                pieces: pieces ?? undefined,
                weight: weight ?? undefined,
                licount: rec.licount ?? undefined,
                lilist: rec.lilist ?? undefined,
                route,
                carrier: String(carrierId ?? ""),
                packing_slip_provided: packingSlipProvided ?? undefined,
                rcvrefrigerationreq: rcvrefrigerationreq ?? undefined,
                rcvfreezingreq: rcvfreezingreq ?? undefined,
                rcvbfheld: rcvbfheld ?? undefined,
                rcvcrypto: rcvcrypto ?? undefined,
                prefixcode,
                deliveryrecipient: deliveryrecipient ?? undefined,
                remarks,
                deliverydate: deliverydate ?? undefined,
                status_id: rec.status_id,
              }}
              type={type}
            />

            {/* Box Attributes — only visible to LOC users */}
            {formState.locUser && (
              /* editable and boxId are forwarded as future props once BoxAttributesGridController
                 widens its interface. For now spread via any to avoid prop mismatch errors. */
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              <BoxAttributesGridController
                data={rec.boxAttributesIn ?? []}
                {...({ editable, boxId: rec.receivingid ?? undefined } as any)}
              />
            )}

            {/* Line Items — data cast to LineItemRow[] since LineItem has more fields
                than the existing controller's narrow interface; the extra fields are
                safely ignored by the grid. onUpdate and other props forwarded as any
                until LineItemsGridController widens its interface. */}
            <LineItemsGridController
              data={
                lineItems as unknown as Parameters<
                  typeof LineItemsGridController
                >[0]["data"]
              }
              {...({
                editable,
                received: formState.received,
                draft: formState.draft,
                existingDiscrepant: formState.existingDiscrepant,
                cpsReceiving: formState.cpsReceiving,
                type,
                onUpdate: handleLineItemUpdate,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } as any)}
            />
          </Box>
        )}

        {/* Tab 1 — Previous Receipts (hidden when isPreviousReceipt or draft) */}
        {activeTab === 1 && !formState.isPreviousReceipt && (
          <Box sx={{ pt: 2 }}>
            {/* type forwarded as a future prop; spread via any until interface widens */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <PreviousReceiptsController
              data={rec.previousReceipts ?? []}
              {...({ type } as any)}
            />
          </Box>
        )}

        {/* Tab 2 — Draft Receipts */}
        {activeTab === 2 && !formState.isPreviousReceipt && formState.draft && (
          <Box sx={{ pt: 2 }}>
            {/* type forwarded as a future prop; spread via any until interface widens */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <DraftReceiptsController
              data={rec.draftReceipts ?? []}
              {...({ type } as any)}
            />
          </Box>
        )}
      </Box>

      {/* Snackbar alert */}
      <Snackbar
        open={Boolean(alertMsg)}
        autoHideDuration={6000}
        onClose={() => setAlertMsg(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={alertSeverity}
          onClose={() => setAlertMsg(null)}
          sx={{ width: "100%" }}
        >
          {alertMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
