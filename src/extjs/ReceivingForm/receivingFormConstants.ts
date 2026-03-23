/**
 * Constants for the Receiving Form module.
 * Extracted from Hammerhead.view.receiving.ReceivingForm (ExtJS source)
 * and the referenced Hammerhead.constants namespace.
 *
 * Covers:
 *  - INTERNAL_ROUTE          — internal route ID constants
 *  - CARGO_STATUS            — package/cargo status IDs
 *  - LABEL_TYPE              — label type identifiers
 *  - WCS_SORT                — WCS conveyor sort end-value
 *  - LOGGING_COMPONENT       — logging component ID for the Receiving module
 *  - RECEIVING_TOOLBAR_ACTIONS — toolbar button descriptors (text + itemId)
 *  - MARK_PACK_SHIP_MESSAGES — special-handling banner message map
 *  - FROM_MOS_OPTIONS        — static options for the "From MOS" lookup
 *  - FIELD_DEFAULTS          — default labelWidth/width applied to form fields
 *  - TAB_INDICES             — tabIndex assignments matching the ExtJS source
 */

// ---------------------------------------------------------------------------
// Internal route constants
// ---------------------------------------------------------------------------

/**
 * Route identifiers used throughout the receiving form to drive field
 * visibility, validation, and print behaviour.
 */
export const INTERNAL_ROUTE = {
  /** Standard PSB route — disables certain bypass options. */
  PSB: 'PSB',
  /** Local delivery route — enables bypass-box label printing. */
  LOCAL_DELIVERY: 'LOCAL_DELIVERY',
  /** Local-only route (subset of local delivery). */
  LOCAL_ONLY: 'LOCAL_ONLY',
  /** Customer pickup route — enables bypass-box label printing. */
  CUSTOMER_PICKUP: 'CUSTOMER_PICKUP',
  /** Discrepant route — form routes line items to discrepancy queue. */
  DISCREPANT: 'DISCREPANT',
  /** TFC route — set automatically when LOC packing is required (BASLOGS-20815). */
  TFC: 'TFC',
} as const;

export type InternalRoute = typeof INTERNAL_ROUTE[keyof typeof INTERNAL_ROUTE];

// ---------------------------------------------------------------------------
// Cargo / package status constants
// ---------------------------------------------------------------------------

export const CARGO_STATUS = {
  DRAFT: 'DRAFT',
  ONHAND: 'ONHAND',
} as const;

export type CargoStatus = typeof CARGO_STATUS[keyof typeof CARGO_STATUS];

// ---------------------------------------------------------------------------
// Label type constants
// ---------------------------------------------------------------------------

export const LABEL_TYPE = {
  PACKAGE: 'PACKAGE',
  OUTER: 'OUTER',
} as const;

export type LabelType = typeof LABEL_TYPE[keyof typeof LABEL_TYPE];

// ---------------------------------------------------------------------------
// WCS sort constants
// ---------------------------------------------------------------------------

export const WCS_SORT = {
  /** End-of-sort sentinel value printed on conveyor barcodes when no unique
   *  sort ID can be resolved. */
  END: 'END',
} as const;

// ---------------------------------------------------------------------------
// Logging component
// ---------------------------------------------------------------------------

/** Logging component ID passed to the LoggingGrid for Receiving records. */
export const LOGGING_COMPONENT = {
  RECEIVING: 'RECEIVING',
} as const;

// ---------------------------------------------------------------------------
// Open-view action identifiers
// ---------------------------------------------------------------------------

export const OPEN_VIEW_ACTIONS = {
  VIEW_RECEIVING: 'VIEW_RECEIVING',
} as const;

// ---------------------------------------------------------------------------
// Mark-pack-ship special handling message map
// ---------------------------------------------------------------------------

/**
 * Maps a data condition key to the human-readable banner message shown to
 * the user at form load.  The associated CSS class (from the legacy ExtJS
 * `markPackShipCls`) is included for reference; map it to your own styling.
 *
 * Priority order matches the original if/else-if chain in initComponent.
 */
export const MARK_PACK_SHIP_MESSAGES = [
  {
    key: 'weapons',
    /** tireq === 'WEA' */
    condition: 'tireq_wea',
    message: 'Contains Weapons/Ammunition.',
    legacyCls: 'x-form-markpackship-red',
  },
  {
    key: 'refrigeration',
    /** refrigerationreq === 'YES' || freezingreq === 'YES' */
    condition: 'refrigeration_or_freezing',
    message: 'Refrigeration or Freezing Required.',
    legacyCls: 'x-form-markpackship-blue',
  },
  {
    key: 'hazmat',
    /** containshazmat === 'YES' */
    condition: 'hazmat',
    message: 'Contains Hazmat Material.',
    legacyCls: 'x-form-markpackship-yellow',
  },
  {
    key: 'bfheld',
    /** containsbfheld === 'YES' */
    condition: 'bfheld',
    message: 'Contains RPGHELD.',
    legacyCls: null,
  },
  {
    key: 'crypto',
    /** containscrypto === 'YES' */
    condition: 'crypto',
    message: 'Contains Crypto.',
    legacyCls: null,
  },
  {
    key: 'secure_or_special',
    /** markpackship contains 'Special Handling=Yes' or 'Secure Tran sport=Yes'
     *  OR secureshipmentreq === 'YES' */
    condition: 'special_handling_or_secure_transport',
    message: 'Special Handling or Secure Transport Required.',
    legacyCls: 'x-form-markpackship-green',
  },
] as const;

// ---------------------------------------------------------------------------
// Toolbar action descriptors
// ---------------------------------------------------------------------------

/**
 * Describes each toolbar button shown in the receiving bar (editable mode)
 * and receipt bar (view mode).  These are presentational descriptors only —
 * wire the `handler` field in the controller component.
 *
 * Extracted from the `receivingBar` and `receiptBar` definitions in the
 * ExtJS source (pages 13–15).
 */
export const TOOLBAR_ACTIONS = {
  /** Submit the form (onSave(false, false)). */
  SUBMIT: { text: 'Submit', itemId: 'submit' },
  /** Print the hand receipt (onSave(true, false)). */
  HAND_RECEIPT: { text: 'Hand Receipt', itemId: 'handReceipt' },
  /** Open the ordered items window. */
  ORDERED_ITEMS: { text: 'Ordered Items', itemId: 'orderedItems' },
  /** Open print sub-menu. */
  PRINT: { text: 'Print', itemId: 'print' },
  /** Print → Receiving Label sub-item. */
  PRINT_RECEIVING_LABEL: { text: 'Receiving Label', itemId: 'recLabel' },
  /** Print → DVV Receiving Label sub-item (b3 only). */
  PRINT_DVV_LABEL: { text: 'DVV Receiving Label', itemId: 'cpsLabel' },
  /** Print → Package Label sub-item. */
  PRINT_PACKAGE_LABEL: { text: 'Package Label', itemId: 'boxLabel' },
  /** Print → Packing List Label sub-item. */
  PRINT_PACKING_LIST: { text: 'Packing List Label', itemId: 'packingList' },
  /** Print → Routing Slip sub-item. */
  PRINT_ROUTING_SLIP: { text: 'Routing Slip', itemId: 'routingSlip' },
  /** Print → This Record sub-item. */
  PRINT_THIS_RECORD: { text: 'This Record', itemId: 'thisRecord' },
  /** Mark packages as delivered to customer. */
  DELIVERED_TO_CUSTOMER: { text: 'Delivered To Customer', itemId: 'deliveredToCustomer' },
  /** Save as draft (onSave(false, true)). */
  SAVE_AS_DRAFT: { text: 'Save As Draft', itemId: 'saveAsDraft' },
  /** Open the audit log window. */
  VIEW_AUDIT_LOG: { text: 'View Audit Log', itemId: 'viewAuditLog' },
  /** Cancel this receiving record. */
  CANCEL_RECORD: { text: 'Cancel Record', itemId: 'cancelRecord' },
  /** Navigate to the SON. */
  GO_TO_SON: { text: 'SON', itemId: 'goToSon' },
} as const;

// ---------------------------------------------------------------------------
// "From MOS" dropdown options
// ---------------------------------------------------------------------------

/**
 * Static options for the "From MOS" lookup combo.
 * Only shown when backhaul === '1'.
 */
export const FROM_MOS_OPTIONS: Array<{ id: string }> = [
  { id: 'SPF' },
  { id: 'SAM' },
];

// ---------------------------------------------------------------------------
// Field layout defaults
// ---------------------------------------------------------------------------

/**
 * Default field dimensions applied via Ext.apply(me.fieldDefaults, ...).
 * Use these when constructing MUI TextField sx props.
 */
export const FIELD_DEFAULTS = {
  labelWidth: 170,
  width: 450,
} as const;

// ---------------------------------------------------------------------------
// Tab index assignments
// ---------------------------------------------------------------------------

/**
 * Tab-order indices for each interactive field, matching the original
 * tabIndex values in the ExtJS form definition.
 *
 * Use these with the MUI `inputProps.tabIndex` prop to preserve keyboard
 * navigation order.
 */
export const TAB_INDICES = {
  receivedDate: 1,
  pieces: 3,
  weight: 4,
  packingListProvided: 6,
  noLineItemReceiving: 5,
  bypassBox: 7,
  handDelivery: 8,
  deliveredTo: 9,
  route: 12,
  carrier: 13,
  dvvReceiving: 14,
  basisPrefix: 15,
  refrigerationRequired: 16,
  freezingRequired: 17,
  rpgheld: 17,
  crypto: 18,
  remarks: 18,
  doNotSendToGenesis: 6,
  handDeliveredDate: 17,
} as const;

// ---------------------------------------------------------------------------
// Validation messages
// ---------------------------------------------------------------------------

/**
 * Human-readable validation error strings returned by advancedValidationIssues().
 * Extracted verbatim from the ExtJS source for parity.
 */
export const VALIDATION_MESSAGES = {
  routeMustChange: 'The route must be changed to resolve a discrepancy.',
  missingDiscrepantReason: 'Missing Line Item Discrepant reason.',
  invalidReceiving: '', // populated dynamically from lineItemGrid
  rpgheldBoxMismatch: 'RPGHELD requires Total Boxes added to Box Attributes to equal the number of Pieces selected',
  cryptoBoxMismatch: 'Crypto requires Total Boxes added to Box Attributes to equal the number of Pieces selected',
  totalBoxMismatch: 'Total Boxes added to Box Attributes does not equal number of Pieces selected',
  rpgheldDimsMissing: 'RPGHELD requires DIMs and Weight in Box Attributes to be greater than 0. Please correct row(s).',
  cryptoDimsMissing: 'Crypto requires DIMs and Weight in Box Attributes to be greater than 0. Please correct row(s).',
  boxPieceMissing: 'Box/Piece information missing for line item received',
  boxPieceNotFound: 'Box/Piece information not found for Box ', // append box number
  lineQtyMismatch: 'Line item receive quantity does not match total quantity in Box/Piece for Line # ', // append line numbers
  missingBinLot: 'A lot & bin are required for a received line item with a lot type of LOT. Please fix line #(s) ', // append line numbers
  lineNotPrevReceived: 'Line item not previously received, the receive quantity cannot be updated for Line # ', // append line numbers
  responsibleOfficeRequired: 'Responsible office code is required for returned line items.',
  assetInfoMissing: 'Asset information not found for a Rotating Line',
  noBoxExists: 'Box/Piece does not exist for Box ID [', // append box num + ']'
  blankReferenceNumber: 'Found blank reference number. Please correct or remove row.',
} as const;
