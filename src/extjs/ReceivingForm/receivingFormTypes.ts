/**
 * Type definitions for the Receiving Form module.
 * Extracted from Hammerhead.view.receiving.ReceivingForm (ExtJS source).
 *
 * Covers:
 *  - ReceivingRecord          — the top-level data record bound to the form
 *  - LineItem                 — a single receiving line item
 *  - BoxItem                  — a box/piece entry within a line item
 *  - AssetItem                — a rotating-asset serial entry
 *  - BoxAttribute             — box dimension/weight row in Box Attributes grid
 *  - ReferenceNumber          — a tracking/reference number row
 *  - PreviousReceipt          — a previously-received record shown in the grid
 *  - Package                  — a generated package after submission
 *  - ReceivingFormState       — local component state shape
 *  - ReceivingFormMode        — union of the two operating modes (new / edit)
 *  - ReceivingType            — the `type` discriminator ('b1' | 'b3' | 'b5')
 *  - MarkPackShipSeverity     — special-handling colour classification
 */

// ---------------------------------------------------------------------------
// Primitive enumerations
// ---------------------------------------------------------------------------

/** Receiving type discriminator.
 *  b1 = standard BCS receiving
 *  b3 = CPS/DVV receiving
 *  b5 = Aptic receiving
 */
export type ReceivingType = 'b1' | 'b3' | 'b5';

/** Draft status id from the server (1 = draft). */
export type StatusId = 1 | 2 | null;

/** Colour severity applied to the Shipping & Handling Comments banner. */
export type MarkPackShipSeverity = 'red' | 'blue' | 'yellow' | 'green' | null;

/** Yes/No string flag used throughout the legacy data model. */
export type YesNo = 'YES' | 'NO';

/** Binary string flag used for checkbox-like columns (handdelivery, etc.). */
export type BinaryFlag = '0' | '1';

// ---------------------------------------------------------------------------
// Child record shapes
// ---------------------------------------------------------------------------

export interface BoxItem {
  boxnum: string;
  quantity: number;
}

export interface AssetItem {
  /** Serial number — must be non-empty for asset validation to pass. */
  serialnum: string | null;
}

export interface LineItem {
  /** Server-assigned line-item ID. Null until persisted. */
  rl_id: number | null;
  line_number: number;
  linetype: 'SERVICE' | 'STDSERVICE' | 'LOT' | string;
  rec_qty: number | null;
  orig_rec_qty: number | null;
  disc_cargo: string | null;
  genesis_id: number | null;
  respoffcode: string | null;
  rotating: YesNo | null;
  binnum: string | null;
  lotnum: string | null;
  boxItems: BoxItem[];
  assetItems: AssetItem[];
}

export interface BoxAttribute {
  id: number | null;
  boxId: number;
  boxType: string;
  /** Length in inches. 0 means not entered. */
  length: number;
  /** Width in inches. 0 means not entered. */
  width: number;
  /** Height in inches. 0 means not entered. */
  height: number;
  /** Weight in pounds. 0 means not entered. */
  weight: number;
}

export interface ReferenceNumber {
  id: number | null;
  referenceNumber: string;
  referenceNumberType: { id: number } | null;
  comments: string;
  scannedDate: string | null;
}

export interface PreviousReceipt {
  id: number;
  son: string;
  route: string;
  status_id: StatusId;
}

export interface Package {
  id: number;
  packageId: string;
  boxId: number | null;
  /** True when the package was saved as a draft. */
  isDraft: boolean;
  statusId: number;
  statusDesc: string;
}

// ---------------------------------------------------------------------------
// Top-level receiving record
// ---------------------------------------------------------------------------

export interface ReceivingRecord {
  /** Server-assigned receiving ID. Null for new records. */
  id: number | null;
  receivingid: number | null;
  sonid: number;
  son: string;
  ponum: string | null;
  genesispoid: number | null;

  // Status
  status_id: StatusId;
  draft: boolean;

  // Dates
  receiveddate: string | null;
  dateout: string | null;
  datereqatdest: string | null;

  // Shipping information (read-only display fields)
  final_destination: string | null;
  bscdocnumber: string | null;
  address: string | null;
  satellite_location: string | null;
  shiptoname: string | null;
  purpose: string | null;
  markpackship: string | null;
  tireq: string | null;
  esmtid: string | null;
  shiptoaresid: number | null;
  shiptostationid: number | null;

  // Special handling flags (from shipping order — display only)
  tireq_display: string | null;
  containscrypto: YesNo | null;
  containsweapons: YesNo | null;
  containsammo: YesNo | null;
  containsbfheld: YesNo | null;
  containshazmat: YesNo | null;
  containslithiumbatt: YesNo | null;
  containsconcealmentdvc: YesNo | null;
  containsaccountableproperty: boolean;
  refrigerationreq: YesNo | null;
  freezingreq: YesNo | null;
  secureshipmentreq: YesNo | null;

  // Receiving input fields
  pieces: number | null;
  weight: number | null;
  licount: number | null;
  lilist: string | null;
  route: string | null;
  carrier_id: number | null;
  prefixcode: string | null;
  remarks: string | null;
  racklocation: string | null;
  rackOfficerId: number | null;
  rackList: string | null;
  rackComment: string | null;

  // Checkbox fields
  nolines: BinaryFlag;
  nobox: BinaryFlag;
  packing_slip_provided: BinaryFlag | null;
  handdelivery: BinaryFlag;
  qty_adjustment_only: BinaryFlag | null;
  cps: BinaryFlag | null;
  aptic: boolean;

  // Receiving-specific radio/Yes-No fields
  rcvrefrigerationreq: YesNo | null;
  rcvfreezingreq: YesNo | null;
  rcvbfheld: YesNo | null;
  rcvcrypto: YesNo | null;

  // Hand delivery
  deliveryrecipient: string | null;
  deliverydate: string | null;

  // Cargo classification
  backhaul: BinaryFlag | null;
  frommos: 'SPF' | 'SAM' | null;
  allow_packages: YesNo | null;

  // Aptic-specific
  sotypeid: number | null;
  tasktypeid: number | null;
  taskreceivepieces: number | null;
  taskpackages: number | null;

  // Misc
  receivedfromincominggcargo: 'Y' | 'N' | null;
  rcvbfheld_display: BinaryFlag | null;
  rcvcrypto_display: BinaryFlag | null;

  // Child collections
  lineItems: LineItem[];
  boxItems: BoxItem[];
  boxAttributesIn: BoxAttribute[];
  referenceNumbers: ReferenceNumber[];
  previousReceipts: PreviousReceipt[];
  draftReceipts: PreviousReceipt[];
  packages: Package[];
  boxIds: number[];
  draftmaxboxid: number | null;
  sonmaxboxid: number | null;
}

// ---------------------------------------------------------------------------
// Form operating mode
// ---------------------------------------------------------------------------

export type ReceivingFormMode = 'new' | 'edit';

// ---------------------------------------------------------------------------
// Local component state
// ---------------------------------------------------------------------------

export interface ReceivingFormState {
  /** True when the record has already been submitted (received). */
  received: boolean;
  /** True when the record is in draft status (status_id === 1). */
  draft: boolean;
  /** True when this is a previously-received record being viewed/edited. */
  isPreviousReceipt: boolean;
  /** True when the current user is a LOC user. */
  locUser: boolean;
  /** True when the current user is a WMA user. */
  wmaUser: boolean;
  /** True when the current user is at a LOC Building (not a station). */
  isAtLocBuilding: boolean;
  /** True when the current user is at a LOC Building-D. */
  isAtLocBuildingD: boolean;
  /** True when this is a BCS (b1) receiving. */
  bcsReceiving: boolean;
  /** True when this is a CPS/DVV (b3) or status=1+cps receiving. */
  cpsReceiving: boolean;
  /** True when this is an Aptic receiving. */
  apticReceiving: boolean;
  /** True when the box-count is out of sync (draftmax vs sonmax). */
  boxIdOutOfSync: boolean;
  /** True when an RPGHELD flag is set on the record. */
  isBfheld: boolean;
  /** True when a crypto flag is set on the record. */
  isCrypto: boolean;
  /** The existing route is set to DISCREPANT. */
  existingDiscrepant: boolean;
  /** The source of incoming cargo string (null | 'Yes' | 'No'). */
  fromIncomingCargo: 'Yes' | 'No' | null;
  /** Whether the packing-list label should be printed on save. */
  printPLLabel: boolean;
  /** CSS class applied to the mark-pack-ship banner. */
  markPackShipCls: string;
  /** Message displayed in the mark-pack-ship banner. */
  markPackShipMsg: string | null;
}

// ---------------------------------------------------------------------------
// Save / submit payload shapes
// ---------------------------------------------------------------------------

export interface TrackingNumberPayload {
  id: number | null;
  reference_number: string;
  comments: string;
  reference_nbr_type_id: number | null;
  scanned_date: string | null;
}

export interface BoxAttributePayload {
  id: number | null;
  boxId: number;
  boxType: string;
  length: number;
  width: number;
  height: number;
  weight: number;
}

export interface ReceivingSubmitPayload extends Omit<ReceivingRecord,
  'referenceNumbers' | 'boxAttributesIn' | 'lineItems'
> {
  trackingNumbers: TrackingNumberPayload[];
  boxAttributes: BoxAttributePayload[];
  lines: LineItem[];
  routingneeded: boolean;
  isSubmitted: boolean;
  draft: boolean;
}

// ---------------------------------------------------------------------------
// API response shapes
// ---------------------------------------------------------------------------

export interface SaveReceivingResponse {
  success: boolean;
  responseObject: {
    id: number;
    packages?: Package[];
    discrepancyId?: number | null;
  };
}

export interface TrackingLookupResult {
  date: string;
  time: string;
  error?: string;
  message?: string;
}
