# ReceivingForm — Comprehensive Analysis & Conversion Reference

**Source:** `Hammerhead.view.receiving.ReceivingForm` (ExtJS, 42-page PDF)
**Conversion target:** Next.js 14 App Router + MUI Material + Redux Toolkit + Axios
**Analysis date:** 2026-03-23

---

## 1. Overview

### Purpose
The Receiving Form is the primary data-entry screen for recording the physical receipt of goods at a warehouse/logistics operation center. It allows staff to:

- Record the date, pieces, weight, route, and carrier for an incoming shipment.
- Enter line-item detail (what was received, in what quantity).
- Attach box/piece physical dimensions (Box Attributes).
- Attach reference/tracking numbers (barcode scans, etc.).
- Review previous and draft receipts against the same Shipping Order Number (SON).
- Print labels (receiving labels, package labels, packing list labels, routing slips, DVV labels).
- Save as a draft or submit the record definitively.
- Cancel a record (with required comment).

### Operating Modes
There are two major operating modes, plus a "type" discriminator:

| Mode flag | Description |
|---|---|
| `editable: true` | Form is in data-entry mode; shows `receivingBar` toolbar |
| `editable: false` | Form is in read-only (receipt) view; shows `receiptBar` toolbar |
| `isPreviousReceipt` | The record already has a `status_id` ≠ null and status ≠ 1 (i.e. previously submitted) |
| `me.draft` | `status_id === 1` — saved as draft |
| `me.received` | Record has been submitted (has a `receivingid`) |

**Receiving type discriminator (`type`):**

| Value | Meaning |
|---|---|
| `b1` | Standard BCS receiving |
| `b3` | CPS/DVV receiving |
| `b5` | Aptic receiving |

### High-Level Architecture

```
ReceivingFormController (orchestrator — state, handlers, validation)
├── Toolbar (receivingBar or receiptBar)
├── Shipping Information fieldset (read-only display)
│   └── Reference/Tracking Numbers grid (referencenumbergrid)
└── TabPanel
    ├── Tab 0: Shipping Information (also contains ReferenceTrackingGrid)
    ├── Tab 1: New Receiving / Receiving (receiving info + BoxAttributes + LineItems)
    ├── Tab 2: Previous Receipts
    ├── Tab 3: Draft Receipts
    ├── Tab 4: Processed Files (AppFilesGrid)
    └── Tab 5: Logs & Comments (LoggingGrid)
```

> **Note:** In the current Next.js conversion `ReceivingTabPanel.tsx` uses 6 tabs but merges Processed Files and Logs into the same set, and uses vertical tab orientation.

---

## 2. ExtJS Components

### Form-level
| xtype | itemId / name | Purpose |
|---|---|---|
| `receivingform` | — | Root form component; extends `Hammerhead.form.Base` |
| `fieldset` | — | "Shipping Information" section (top, always visible) |
| `fieldset` | — | "Reference/Tracking Numbers" section |
| `tabpanel` | — | Main tabbed area; `activeTab` driven by `me.page` |
| `fieldset` | `fsLineItems` | Line Items section on the New Receiving tab |
| `fieldset` | — | "Box Attributes" section (collapsible, LOC users only) |
| `fieldset` | — | "Previous Receipts" section |
| `fieldset` | — | "Draft Receipts" section |
| `fieldset` | — | "Processed Files" section |
| `fieldset` | — | "Logs & Comments" section |

### Grids
| xtype | Purpose |
|---|---|
| `referencenumbergrid` | Reference/tracking numbers; editable inline |
| `receivinglineitemgrid` | Line items for the receiving; inline editable |
| `boxattributegrid` | Box physical dimensions; inline editable |
| `previousreceiptsgrid` | Read-only grid of prior submitted receipts |
| `previousreceiptsgrid` (second instance) | Draft receipts (reuses same grid component, different store) |
| `Hammerhead.grid.AppFilesGrid` | File attachments for the receiving |
| `Hammerhead.view.logging.LoggingGrid` | Audit trail / log entries |

### Fields (Shipping Information — display only)
| name | fieldLabel | Notes |
|---|---|---|
| `son` | SON | Always visible |
| `bscdocnumber` | Contract # | Hidden when `!bcsReceiving` |
| `tireq` | T&I Required | |
| `datereqatdest` | Date Req. at Final Dest. | |
| `esmtid` | ESMT Number | Hidden when `!cpsReceiving && !me.rec.get('cps')` |
| `final_destination` | Destination | |
| `shiptoname` | Vendor Delivery Location | Hidden when empty |
| `address` | Address | anchor 95% |
| `satellite_location` | Satellite Location | |
| `purpose` | Purpose | |
| `markpackship` | Shipping & Handling Comments | Special CSS class applied (`markPackShipCls`) |
| `fromIncomingCargo` (computed) | Received From Incoming Cargo | Hidden when null |
| `containscrypto` | Crypto | |
| `containshazmat` | Hazmat | |
| `containsconcealmentdvc` | Concealment Device | |
| `containslithiumbatt` | Lithium Batteries | |
| `containsweapons` | Weapons | |
| `refrigerationreq` | Refrigeration Required | |
| `containsammo` | Ammo | |
| `freezingreq` | Freezing Required | |
| `containsbfheld` | RPGHELD | |

### Fields (Receiving Information tab — editable)
| xtype (edit) | name | fieldLabel | tabIndex | Notes |
|---|---|---|---|---|
| `datefield` / `displayfield` | `receiveddate` | Date/Time In | 1 | Format: `d M Y H:i`. Required. Editable when `(editable && !received) || draft`. |
| `displayfield` | `dateout` | Date/Time Out | — | Format: `d M Y H:i`. Display-only always. |
| `displayfield` | `taskreceivepieces` | Total Received Pieces | — | Hidden when `!apticReceiving` |
| `displayfield` | `taskpackages` | Tasking Package Pieces | — | Hidden when `!apticReceiving` |
| `displayfield` | `licount` | Item Count | — | blankText: noLineItemText |
| `displayfield` | `lilist` | Item List | — | blankText: noLineItemText |
| `numberfield` / `displayfield` | `pieces` | Pieces | 3 | Min: 1 (or `taskreceivepieces - 1` for Aptic). Max length 4. No decimals/negatives. Complex disabled logic. |
| `hint` | `needSubmitMsg` | — | — | Message: `wholeNumberMeasurements` |
| `numberfield` / `displayfield` | `weight` | Weight | 4 | Min: 1. Decimals allowed. No negatives. Max length 5. |
| `lookupcombo` | `carrier_id` | Carrier | 13 | Populated from `me.carriers` store. Auto-selects "SON" carrier on new receiving. |
| `lookupcombo` | `route` | Route | 12 | Filtered list. Complex auto-select logic. Required for LOC users / b1. |
| `hint` | `packingListProvidedMsg` | — | — | Tip text for packing list. Hidden for non-LOC. |
| `hint` | `bypassBoxMsg` | — | — | Tip text for bypass box. Hidden for non-LOC. |
| `betterradiogroup` / `displayfield` | `packing_slip_provided` | Packing List Provided | 6 | Required for LOC users. Disabled when received && !draft (or !isPreviousReceipt). |
| `checkbox` / `displayfield` | `nobox` | Bypass Box/Piece Information | 7 | Hidden for non-LOC. Disabled when received && !draft or route not LOCAL_DELIVERY/CUSTOMER_PICKUP. |
| `betterradiogroup` / `displayfield` | `rcvrefrigerationreq` | Refrigeration Required | 16 | Hidden/required for LOC users. |
| `betterradiogroup` / `displayfield` | `rcvfreezingreq` | Freezing Required | 17 | Hidden/required for LOC users. |
| `betterradiogroup` / `displayfield` | `rcvbfheld` | RPGHELD | 17 | Hidden/required for LOC users. |
| `betterradiogroup` / `displayfield` | `rcvcrypto` | Crypto | 18 | Hidden/required for LOC users. |
| `checkbox` / `displayfield` | `nolines` | No Line Item Receiving | 5 | Tooltip: "Select No Line Item Receiving if line item information will not be entered in prior to submitting." Disabled: `(received || type !== 'b5') && !me.draft || (draft && type !== 'b5')`. Listener: `onNoLineItemChange`. |
| `checkbox` / `displayfield` | `cps` | DVV Receiving | 14 | Label in red. Disabled when `!cpsReceiving`. `allowBlank: !cpsReceiving`. |
| `checkbox` / `displayfield` | `qty_adjustment_only` | Do Not Send To Genesis | 6 | Hidden for non-FRANSUPTU users. Disabled when `!fransuptUser || received`. |
| Combo (createBasisPrefix) | `prefixcode` | BASIS Prefix | 15 | Shown only for b1 type. `allowBlank: type !== 'b1'`, `disabled: type !== 'b1'`. Store: PrefixCodes. |
| `checkbox` / `displayfield` | `handdelivery` | Hand Delivery | 8 | Disabled for LOC users or when received. Listener: `onHandDelivery`. |
| `personfield` / `displayfield` | `deliveryrecipient` | Delivered To | 9 | LDAP lookup. Required only when `handDelivery`. Disabled when not hand delivery. |
| `datefield` / `displayfield` | `deliverydate` | Hand Delivered Date | 17 | Required when hand delivery. |
| `racklocationfield` | `racklocation` | (Rack Location) | — | Hidden for non-LOC/non-WMA users (unless apticReceiving). Disabled when received && !draft. |
| `textarea` / `displayfield` | `remarks` | Receiving Remarks | 18 | Width 95%. |

### Windows/Dialogs
| Class | Purpose |
|---|---|
| `Hammerhead.window.AuditLogWindow` | Audit log viewer, opened by "View Audit Log" button |
| `Hammerhead.window.receiving.BoxMultiple` | Opened when multiple boxes are needed |
| `Hammerhead.window.shippingreference.EditRackLocation` | Rack location editor |
| `Hammerhead.window.receiving.OrderedItems` | Ordered items viewer, opened by "Ordered Items" button |
| `Hammerhead.window.InputWindow` | Comment entry for cancel record |
| `Ext.window.MessageBox` | Used throughout for alerts and confirmations |

---

## 3. Data Model

### Top-Level Record Fields

| Field | Type | Default / Source | Description |
|---|---|---|---|
| `id` | number \| null | null for new | Server-assigned receiving record ID |
| `receivingid` | number \| null | null for new | Alias for the receiving ID |
| `sonid` | number | required | Shipping Order ID |
| `son` | string | required | Shipping Order Number (human-readable) |
| `ponum` | string \| null | null | Purchase Order number |
| `genesispoid` | number \| null | null | Genesis PO ID (used for cancel logic) |
| `status_id` | 1 \| 2 \| null | null | 1 = draft, 2 = submitted |
| `draft` | boolean | derived | `status_id === 1` |
| `receiveddate` | string \| null | null | Date/Time In; format `d M Y H:i` |
| `dateout` | string \| null | null | Date/Time Out |
| `datereqatdest` | string \| null | null | Date Required at Final Destination |
| `final_destination` | string \| null | null | Destination display |
| `bscdocnumber` | string \| null | null | Contract # (BCS only) |
| `address` | string \| null | null | Delivery address |
| `satellite_location` | string \| null | null | Satellite location |
| `shiptoname` | string \| null | null | Vendor delivery location |
| `purpose` | string \| null | null | Purpose of shipment |
| `markpackship` | string \| null | null | Shipping & Handling comments string |
| `tireq` | string \| null | null | T&I requirement; `'WEA'` triggers weapons banner |
| `esmtid` | string \| null | null | ESMT number (CPS only) |
| `shiptoaresid` | number \| null | null | Ship-to area/building ID |
| `shiptostationid` | number \| null | null | Ship-to station ID |
| `containscrypto` | 'YES'\|'NO'\|null | null | |
| `containsweapons` | 'YES'\|'NO'\|null | null | |
| `containsammo` | 'YES'\|'NO'\|null | null | |
| `containsbfheld` | 'YES'\|'NO'\|null | null | |
| `containshazmat` | 'YES'\|'NO'\|null | null | |
| `containslithiumbatt` | 'YES'\|'NO'\|null | null | |
| `containsconcealmentdvc` | 'YES'\|'NO'\|null | null | |
| `containsaccountableproperty` | boolean | false | Triggers "Contains Accountable Property" alert |
| `refrigerationreq` | 'YES'\|'NO'\|null | null | From shipping order |
| `freezingreq` | 'YES'\|'NO'\|null | null | From shipping order |
| `secureshipmentreq` | 'YES'\|'NO'\|null | null | From shipping order |
| `pieces` | number \| null | null | Total received pieces |
| `weight` | number \| null | null | Total weight (lbs) |
| `licount` | number \| null | null | Line item count (computed from line items) |
| `lilist` | string \| null | null | Comma-joined line item numbers |
| `route` | string \| null | null | Route ID (INTERNAL_ROUTE constant) |
| `carrier_id` | number \| null | null | Carrier lookup ID |
| `prefixcode` | string \| null | null | BASIS Prefix (b1 only) |
| `remarks` | string \| null | null | Receiving remarks / notes |
| `racklocation` | string \| null | null | Rack location string |
| `rackOfficerId` | number \| null | null | |
| `rackList` | string \| null | null | |
| `rackComment` | string \| null | null | |
| `nolines` | '0'\|'1' | '0' | No line item receiving checkbox |
| `nobox` | '0'\|'1' | '0' | Bypass box/piece checkbox |
| `packing_slip_provided` | '0'\|'1'\|null | null | Packing list provided radio |
| `handdelivery` | '0'\|'1' | '0' | Hand delivery checkbox |
| `qty_adjustment_only` | '0'\|'1'\|null | null | Do not send to Genesis |
| `cps` | '0'\|'1'\|null | null | DVV receiving checkbox |
| `aptic` | boolean | derived | Aptic receiving flag |
| `rcvrefrigerationreq` | 'YES'\|'NO'\|null | null | Refrigeration required (receiving entry) |
| `rcvfreezingreq` | 'YES'\|'NO'\|null | null | Freezing required (receiving entry) |
| `rcvbfheld` | 'YES'\|'NO'\|null | null | RPGHELD (receiving entry) |
| `rcvcrypto` | 'YES'\|'NO'\|null | null | Crypto (receiving entry) |
| `deliveryrecipient` | string \| null | null | LDAP person name for hand delivery |
| `deliverydate` | string \| null | null | Hand delivered date |
| `backhaul` | '0'\|'1'\|null | null | Backhaul flag |
| `frommos` | 'SPF'\|'SAM'\|null | null | From MOS (backhaul only) |
| `allow_packages` | 'Y'\|'N'\|null | null | Whether packages are allowed |
| `sotypeid` | number \| null | null | Aptic: SO type ID |
| `tasktypeid` | number \| null | null | Aptic: task type ID |
| `taskreceivepieces` | number \| null | null | Aptic: total received pieces |
| `taskpackages` | number \| null | null | Aptic: tasking package pieces |
| `receivedfromincominggcargo` | 'Y'\|'N'\|null | null | Flag; displayed as 'Yes'/'No' |
| `lineItems` | LineItem[] | [] | Child line items |
| `boxItems` | BoxItem[] | [] | Box items (deprecated in favor of boxAttributesIn) |
| `boxAttributesIn` | BoxAttribute[] | [] | Box dimension/weight rows |
| `referenceNumbers` | ReferenceNumber[] | [] | Tracking/reference numbers |
| `previousReceipts` | PreviousReceipt[] | [] | Previous submitted receipts |
| `draftReceipts` | PreviousReceipt[] | [] | Draft receipts |
| `packages` | Package[] | [] | Packages generated after submission |
| `boxIds` | number[] | [] | IDs of existing boxes |
| `draftmaxboxid` | number \| null | null | Max box ID from draft |
| `sonmaxboxid` | number \| null | null | Max box ID from SON |

### LineItem Fields

| Field | Type | Description |
|---|---|---|
| `rl_id` | number \| null | Server-assigned receiving line ID |
| `line_number` | number | Line number |
| `linetype` | string | 'SERVICE', 'STDSERVICE', 'LOT', etc. |
| `rec_qty` | number \| null | Received quantity |
| `orig_rec_qty` | number \| null | Original received quantity (for returns) |
| `disc_cargo` | string \| null | Discrepancy cargo reason |
| `genesis_id` | number \| null | Genesis system ID |
| `respoffcode` | string \| null | Responsible office code (required for returns) |
| `rotating` | 'YES'\|'NO'\|null | Whether item is rotating/asset-tracked |
| `binnum` | string \| null | Bin number (required for LOT type) |
| `lotnum` | string \| null | Lot number (required for LOT type) |
| `boxItems` | BoxItem[] | Box numbers and quantities |
| `assetItems` | AssetItem[] | Asset serial numbers |

### BoxAttribute Fields

| Field | Type | Description |
|---|---|---|
| `id` | number \| null | Server ID |
| `boxId` | number | Box number (must be > 0 to save) |
| `boxType` | string | Box type code |
| `length` | number | Length in inches (0 = not entered) |
| `width` | number | Width in inches |
| `height` | number | Height in inches |
| `weight` | number | Weight in pounds |

### ReferenceNumber Fields

| Field | Type | Description |
|---|---|---|
| `id` | number \| null | Server ID |
| `referenceNumber` | string | The tracking/reference number text |
| `referenceNumberType` | `{ id: number }` \| null | Type ID (1 = SON, 4 = Other) |
| `comments` | string | Comment |
| `scannedDate` | string \| null | Date/time the barcode was scanned |

### Package Fields

| Field | Type | Description |
|---|---|---|
| `id` | number | Server ID |
| `packageId` | string | Human-readable package ID |
| `boxId` | number \| null | Associated box ID |
| `isDraft` | boolean | Whether package is draft |
| `statusId` | number | Status |
| `statusDesc` | string | Status description |

---

## 4. Business Logic

### Boolean State Derivation (initComponent)

All booleans are derived at form initialization from the record data and current user context:

```
handDelivery      = rec.handdelivery === '1'
bcsReceiving      = type === 'b1'
cpsReceiving      = type === 'b3' || ((rec.status_id !== null && rec.status_id === 1) && rec.cps)
apticReceiving    = CurrentUser.getPreference('showAptic') && rec.sotypeid === 1 && rec.tasktypeid === 1
recid             = rec.receivingid
allowPackages     = rec.allow_packages
isPreviousReceipt = !isNewReceiving()   [see below]
draftReceipts     = hasDraftReceipts()
previousReceipts  = hasPreviousReceipts()
fromIncomingCargo = rec.receivedfromincominggcargo === null ? null : (==='Y' ? 'Yes' : 'No')
locUser           = CurrentUser.isLOCUser()
isAtLocBuilding   = CurrentUser.isAtLocBuilding()
isAtLocBuildingD  = CurrentUser.isAtLocBuildingD()
wmaUser           = CurrentUser.isWMAUser()
hhLite            = !CurrentUser.isLOCUser() && !CurrentUser.isFRANSUPTUser()
fransuptUser      = CurrentUser.isFRANSUPTUser()
received          = !Ext.isEmpty(recid)
draft             = rec.status_id !== null && rec.status_id === 1
boxIdOutOfSync    = (rec.draftmaxboxid ?? 0) > 0 && (rec.sonmaxboxid ?? 0) > (rec.draftmaxboxid ?? 0)
isBfheld          = rec.rcvbfheld !== null && rec.rcvbfheld === '1'
isCrypto          = rec.rcvcrypto !== null && rec.rcvcrypto === '1'
existingDiscrepant = rec.route === INTERNAL_ROUTE.DISCREPANT
```

### `isNewReceiving()`
```
return rec.id === null || rec.data.id === rec.data.sonid || (rec.status_id !== null && rec.status_id === 1)
```

### `isPreviousReceiving()`
```
return rec.id !== null || (rec.status_id !== null && rec.status_id === 2)
```

### `isApticReceiving()`
```
return CurrentUser.getPreference('showAptic')
    && rec.sotypeid !== null && rec.sotypeid === 1
    && rec.tasktypeid !== null && rec.tasktypeid === 1
```

### Mark-Pack-Ship Banner (Special Handling Alert)
Evaluated in order; first match wins:

1. `rec.tireq === 'WEA'` → "Contains Weapons/Ammunition." (red)
2. `rec.refrigerationreq === 'YES' || rec.freezingreq === 'YES'` → "Refrigeration or Freezing Required." (blue)
3. `rec.containshazmat === 'YES'` → "Contains Hazmat Material." (yellow)
4. `rec.containsbfheld === 'YES'` → "Contains RPGHELD." (no class)
5. `rec.containscrypto === 'YES'` → "Contains Crypto." (no class)
6. `rec.markpackship contains 'Special Handling=Yes' or 'Secure Transport=Yes'` OR `rec.secureshipmentreq === 'YES'` → "Special Handling or Secure Transport Required." (green)

### `Pieces` Field Disable Logic
```
disabled = (apticReceiving && received && !draft)
        || (((hhLite || wmaUser || route === LOCAL_DELIVERY) || (type === 'b1' && !locUser)) && !cpsReceiving && !draft)
        || (draft && boxIdOutOfSync) && !apticReceiving
```

### `Weight` Field Disable Logic
```
disabled = hhLite || wmaUser || (type === 'b3') && !draft
```

### `Route` Field Enable Logic (`routeIsEnabled()`)
```
routeEnabledForReceivingType = type !== 'b3'
receivedAndDiscrepant = (received && existingRouteIsDiscrepant()) || !existingRoute()
return locUser && routeEnabledForReceivingType && receivedAndDiscrepant || (locUser && draft)
```

Route auto-selection on afterrender:
- If apticReceiving: select route with shortDescription 'pti'
- If new receiving and not draft: select PSB/Pouch route if `isBfheld || isCrypto`; otherwise select "local delivery" if isWMADestination

### `Carrier` Field Auto-Selection
On afterrender (new receiving, not draft): auto-select the carrier whose shortDescription is 'son'.

### Hand Delivery Logic (`onHandDelivery`)
When `handdelivery` checkbox changes:
- `deliverydate.setDisabled(newValue === false || newValue === 'NO')`
- `deliverydate.setRequired(newValue === true || newValue === 'YES')`
- `deliverydate.setValue(newValue ? new Date() : null)`
- `deliveredTo.setDisabled(newValue === false || newValue === 'NO')`
- `deliveredTo.setRequired(newValue === true || newValue === 'YES')`

### Backhaul Logic (`onBackhaul`)
When backhaul changes:
- Enable/disable and require/unrequire the `frommos` combo accordingly.
- Clear the `frommos` value when disabled.

### No Line Item Change (`onNoLineItemChange`)
When the `nolines` checkbox changes:
- Update `fsLineItems` fieldset title (add/remove required mark).
- Set `lineGrid.isReceivingOverride = !reqLi`.
- Call `me.isValid()`.

### `Bypass Box / nobox` Disable Logic
Route-driven: disabled when route is not LOCAL_DELIVERY and not CUSTOMER_PICKUP. When disabled, value is forced to false.

### DVV / CPS Checkbox
- Only enabled if `cpsReceiving === true`.
- On form load when `cpsReceiving`, value is forced to `true`.
- `allowBlank: !cpsReceiving`.

### `Do Not Send To Genesis` (`qty_adjustment_only`)
- Only visible/enabled for FRANSUPTU users.
- Disabled when received.

### Discrepancy Route Handling
When route changes away from DISCREPANT (and it was previously DISCREPANT):
- `receivingLineItemGrid.clearDiscrepancies()` is called.

When route changes to DISCREPANT:
- During `onLineItemUpdate`, field `route` is set to `INTERNAL_ROUTE.DISCREPANT`.

### LOC Packing Required
If `locPackingRequired` is true (detected at load), route is automatically set to `INTERNAL_ROUTE.TFC` (BASLOGS-20815).

### Draft Save vs Submit Logic
`onSave(openHandReceipt: boolean, draft: boolean)`:
1. Check if editing tracking numbers → alert user to finish.
2. Check no empty reference numbers in grid.
3. If not draft: run `advancedValidationIssues()` — if any message, show alert and abort.
4. Show saving mask.
5. Update the record from the form.
6. Map reference numbers and box attributes to payload.
7. `POST` to `receiving/movement`.
8. On success: update receivingid, show packages alert, trigger print logic, fire `viewReceiving` event.
9. If draft: show "Receiving saved as draft" message.

### Confirm Delivery (`confirmDelivery`)
- Collects packages with status DRAFT or ONHAND.
- If none found: alert "No packages to mark Delivered".
- Otherwise calls `controller.markPkgsDelivered(packageIds, cb, ...)`.
- On success: show "All packages associated to this Receiving have been marked delivered", then close (500ms delay).

### Cancel Record (`cancelRecord`)
1. Show YESNO confirmation "Are you sure you want to continue?".
2. If confirmed, show input window for comment (required).
3. On comment input: `GET /receiving/movements/delete?recId={id}&comment={comment}`.
4. On success: alert "cancelSuccess" message, call `controller.cancelRecord(me)`, close (1000ms delay).
5. On failure: alert "Failed to Cancel record".

---

## 5. API Endpoints

All URLs are relative to `Hammerhead.data.BASE_URL`.

| Method | URL | Description |
|---|---|---|
| `POST` | `receiving/movement` | Submit or save-as-draft a receiving record |
| `GET` | `receiving/movements/delete?recId={id}` | Cancel a receiving record (with `params.comment`) |
| `GET` | `receiving/tracking/{refNum}` | Mobility tracking number lookup (called when reference number entered) |
| `POST` | `receiving/callCatalog` | Catalog call (test/debug function) |
| `GET/POST` (print) | `print/pdf/cpsLabel.rpt` | Print DVV/CPS receiving label |
| `GET/POST` (print) | `/deliveryreceipt/handreceipt.rpt` | Print hand receipt |
| `GET/POST` (print) | `receiving/movement_detail.rpt` | Print this record |
| Controller methods | `controller.printReceivingLabels(...)` | Print receiving labels (via controller) |
| Controller methods | `controller.printRoutingSlip(...)` | Print routing slip (via controller) |
| Controller methods | `controller.printPackageLabels(...)` | Print package labels (via controller) |
| Controller methods | `controller.printConveyorBarcode(...)` | Print conveyor barcode (via controller) |
| Controller methods | `controller.markPkgsDelivered(...)` | Mark packages as delivered |
| Controller methods | `controller.cancelRecord(...)` | Post-cancel cleanup |

### Save Payload Shape (`POST receiving/movement`)
```json
{
  "id": null,
  "receivingid": null,
  "sonid": 996753,
  "son": "999999901",
  "trackingNumbers": [
    { "id": null, "reference_number": "...", "comments": "...", "reference_nbr_type_id": 1, "scanned_date": null }
  ],
  "boxAttributes": [
    { "id": null, "boxId": 1, "boxType": " ", "length": 0, "width": 0, "height": 0, "weight": 0 }
  ],
  "lines": [ /* LineItem[] */ ],
  "route": "LOCAL_DELIVERY",
  "carrier_id": 5,
  "pieces": 3,
  "weight": 10.5,
  "nolines": "0",
  "nobox": "0",
  "handdelivery": null,
  "qty_adjustment_only": null,
  "backhaul": null,
  "draft": false,
  "routingneeded": true,
  "isSubmitted": true,
  "cps": false,
  "aptic": false,
  "rackOfficerId": null,
  "rackList": null,
  "rackComment": null
}
```

### Save Response Shape
```json
{
  "success": true,
  "responseObject": {
    "id": 12345,
    "packages": [
      { "id": 1, "packageId": "PKG-001", "boxId": 1, "isDraft": false, "statusId": 2, "statusDesc": "ONHAND" }
    ],
    "discrepancyId": null
  }
}
```

### Tracking Lookup Response
```json
{ "date": "1/15/2026", "time": "10:30 AM" }
```

---

## 6. Event Handlers

| Event / Handler | Trigger | Action |
|---|---|---|
| `initComponent` | Form loads | Derives all boolean flags, builds special handling message, runs all `notifyUserOf*` methods |
| `onNoLineItemChange(cb, newValue)` | `nolines` checkbox change | Updates Line Items fieldset title, sets `isReceivingOverride`, calls `isValid()` |
| `onHandDelivery(cb, newValue)` | `handdelivery` checkbox change | Enables/disables/requires `deliverydate` and `deliveredTo` |
| `onBackhaul(f, newValue)` | `backhaul` field change | Enables/disables/requires `frommos` combo |
| `onLineItemUpdate(grid, lineItems, isDiscrepant)` | Line items grid `update` event | Updates `licount` / `lilist` display fields; if discrepant sets route to DISCREPANT |
| `onReferenceNumberEntered(refNum)` | Reference number grid scan | Calls `callMobility(refNum)` → tracking lookup |
| `onChange(f, formValid)` | Form `validitychange` | Enables/disables submit button; after 500ms delay calls `isValid()` |
| `onSave(openHandReceipt, draft)` | Submit / Hand Receipt / Save As Draft buttons | Full save flow (see Section 4) |
| `saveCb(opts, success, resp)` | POST response | Updates receivingid, shows packages, triggers print/close |
| `cancelRecord()` | Cancel Record button | Confirm → comment → DELETE API → close |
| `confirmDelivery()` | Delivered To Customer button | Collects packages → marks delivered via controller |
| `onOrderedItems(b)` | Ordered Items button | Opens `Hammerhead.window.receiving.OrderedItems` window |
| `doPrintBoxLabel(item)` | Print > Package Label | Calls `printPackageLabels` or `printLabel` |
| `printLabel(p_l, p_p_l, printPackList, close, includeRoutingSlip, boxIdsToPrint)` | Various print triggers | Builds print URL and sends to receiving label controller |
| `printCPSpdf(p_l, p_p_l, close)` | DVV Receiving Label | Opens CPS PDF URL in new window |
| `printRList(close, boxIdsToPrint)` | Routing Slip | Calls `controller.printRoutingSlip(...)` |
| `receiptPrint(id)` | Hand Receipt button | Opens hand receipt PDF URL in new window |
| `printRecord()` | Print > This Record | Opens movement detail report URL |
| `doSavePrint(boxIdsToPrint)` | After successful save | Decides which labels to print based on route/flags |
| `handleRouteOption(route)` | After successful save (locUser only) | Resolves conveyor spurs and prints conveyor barcode |
| `callMobility(refNum)` | Reference number entered | `GET receiving/tracking/{refNum}` → `createMb` |
| `createMb(opts, success, resp)` | Tracking response | Parses date/time, updates `receiveddate` if not already set |
| `parseLambdaDateTime(dateStr, timeStr)` | Inside `createMb` | Parses various date/time string formats from Lambda tracking service |

---

## 7. State Management

### ExtJS Approach
State is held as instance properties on the form component (`me.*`) and as field values on the Ext.data.Model (`me.rec`). No external state container.

Key instance properties:
- `me.received` — whether the form is in received/submitted state
- `me.draft` — whether the record is in draft state
- `me.locUser`, `me.wmaUser`, `me.hhLite`, `me.fransuptUser` — user role flags
- `me.isAtLocBuilding`, `me.isAtLocBuildingD` — location flags
- `me.bcsReceiving`, `me.cpsReceiving`, `me.apticReceiving` — type flags
- `me.existingDiscrepant` — route discrepancy flag
- `me.boxIdOutOfSync` — box sync flag
- `me.isBfheld`, `me.isCrypto` — special cargo flags
- `me.fromIncomingCargo` — derived from `receivedfromincominggcargo`
- `me.print_PLLabel` — packing list print flag
- `me.carriers` — cached carrier store reference
- `me.routes` — filtered route array
- `me.AllRoutes` — full route store reference
- `me.wcsConveyorSpurStore` — conveyor spur store
- `me.wmaBuildingStore` — WMA building store

### React/Redux Mapping
The existing Next.js conversion uses:
- **Local `useState`** in each component for UI-only state (edit modes, snackbar open, etc.)
- **Props drilling** from the page component downward
- **No Redux** has been connected yet — all state is currently ephemeral (mock data hardcoded in `page.tsx`)

**Recommended Redux slice structure:**
```typescript
interface ReceivingFormSlice {
  record: ReceivingRecord | null;
  flags: ReceivingFormState;       // all boolean flags
  activeTab: number;
  validationErrors: string[];
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  saveError: string | null;
}
```

---

## 8. Tab Structure

### ExtJS Tab Panel
The `tabpanel` has `activeTab` set from `Ext.Number.from(me.page, 0)`. Tabs are defined as:

| Index | Title | Condition | Content |
|---|---|---|---|
| 0 | "Receiving" (new) or "New Receiving" (previous) | Always shown | Receiving Information fieldset + Box Attributes fieldset + Line Items fieldset + Previous Receipts fieldset + Draft Receipts fieldset |
| — | (above cont'd) | — | Processed Files fieldset (hidden when `!isPreviousReceipt`) + Logs & Comments (hidden when `!isPreviousReceipt`) |

Wait — re-reading the PDF more carefully: the tabpanel wraps the main content area. The items inside the single tab labeled "Receiving" or "New Receiving" include multiple nested fieldsets. Separately, there is **no outer tabpanel** in the original ExtJS; the layout is a single panel with fieldsets stacked vertically inside a center region.

> **Important discrepancy:** The Next.js conversion (`ReceivingTabPanel.tsx`) added tabs (Shipping Information, New Receiving, Previous Receipts, Draft Receipts, Box Attributes, Line Items) that do not directly map to the ExtJS source structure. In the ExtJS source:
> - Shipping Information, Reference Numbers, and the main data entry section are all visible simultaneously on one scroll panel.
> - Previous Receipts, Draft Receipts, Processed Files, and Logs are fieldsets within the same page (not separate tabs).
> - The ExtJS `tabpanel` is only for switching between the "default" main tab and the "receipts" grid tab in non-editable mode.

### Current Next.js Tab Structure (ReceivingTabPanel.tsx)
| Tab index | Label | Component |
|---|---|---|
| 0 | Shipping Information | `ShippingInformation` + `ReferenceTrackingGridController` |
| 1 | New Receiving | `NewReceivingForm` |
| 2 | Previous Receipts | `PreviousReceiptsController` |
| 3 | Draft Receipts | `DraftReceiptsController` |
| 4 | Box Attributes | `BoxAttributesGridController` |
| 5 | Line Items | `LineItemsGridController` |

The Processed Files (AppFilesGrid) and Logs & Comments (LoggingGrid) tabs are **not yet implemented** in the Next.js conversion.

---

## 9. Toolbar & Actions

### Receiving Bar (editable mode — `receivingBar`)

| Button | itemId | Disabled Condition | Handler | Notes |
|---|---|---|---|---|
| Submit | `submit` (index 0) | — | `onSave(false, false)` | Primary action |
| Ordered Items | `orderedItems` | `Ext.isEmpty(rec.ponum)` | `onOrderedItems` | Opens ordered items window |
| Hand Receipt | `handReceipt` | `locUser || !recid || !rec.handdelivery` | `onSave(true, false)` | Only for field process |
| Genesis PO Button | (xtype: genesispobutton) | — | Opens Genesis PO | Custom xtype |
| Print (menu) | `print` | `!received` | — | Dropdown menu |
| Print > Receiving Label | `recLabel` | — | `doPrintBoxLabel` → `printLabel` | |
| Print > DVV Receiving Label | `cpsLabel` | `type !== 'b3'` | `printCPSpdf(false,false,true)` | |
| Print > Package Label | `boxLabel` | `!(boxIds?.length > 0) || (route===LOCAL_DELIVERY && fromIncomingCargo!==null && fromIncomingCargo==='Yes')` | `doPrintBoxLabel` | Tooltip explains conditions |
| Print > Packing List Label | `packingList` | `!locUser` | `printLabel(false,true,true,false,false)` | |
| Print > Routing Slip | `routingSlip` | `!locUser` | `printRList(false)` | |
| Print > This Record | `thisRecord` | — | `printRecord` | |
| Delivered To Customer | `deliveredToCustomer` | `route !== CUSTOMER_PICKUP && route !== LOCAL_ONLY && route !== LOCAL_DELIVERY` | `confirmDelivery` | |
| Save As Draft | `saveAsDraft` | `(received && !draft) || !(locUser || isAtLocBuilding) || apticReceiving` | `onSave(false, true)` | |
| View Audit Log | `viewAuditLog` | `Ext.isEmpty(rec.id)` | Opens `AuditLogWindow` | |
| (separator) | `tbseparator` | Hidden for non-LOC users | — | |
| Cancel Record | `cancelRecord` | Complex (see below) | `cancelRecord()` | Hidden for LOC users when `isPreviousReceipt || status_id !== 1` |

**Cancel Record disabled logic:**
```
disabled = (rec.genesispoid !== null && (isPreviousReceipt || rec.status_id !== 1))
         ? true
         : (fromIncomingCargo === 'Yes' ? true : false)
```
**Cancel Record hidden logic:**
```
hidden = !locUser && (isPreviousReceipt || rec.status_id !== 1)
```
**Cancel Record tooltip:** "To Cancel Genesis Items, you must set line Items to 0. Only items that do not have manifested or packed records may be canceled."

### Receipt Bar (read-only mode — `receiptBar`)

| Button | Handler | Notes |
|---|---|---|
| Go To... > SON | `openView: 'viewSon'` | Navigation |

---

## 10. Validation

### Standard Form Validation
- Uses `Hammerhead.plugin.FormValidation` plugin.
- On validity change: submit button is enabled/disabled.
- `onChange` fires `isValid()` with a 500ms debounce (HAMMER-5719 timing workaround).

### Required Fields
- `receiveddate` (Date/Time In) — `allowBlank: false`
- `pieces` — `allowBlank: !(locUser) && !cpsReceiving && !apticReceiving`
- `weight` — `allowBlank: !locUser || type === 'b3'`
- `packing_slip_provided` — `allowBlank: !locUser`
- `route` — `allowBlank: !locUser || type === 'b3'`
- `rcvrefrigerationreq` — `allowBlank: !locUser`
- `rcvfreezingreq` — `allowBlank: !locUser`
- `rcvbfheld` — `allowBlank: !locUser`
- `rcvcrypto` — `allowBlank: !locUser`
- `nolines` — effectively required; triggers line item requirement
- `deliveryrecipient` — `allowBlank: !handDelivery`
- `deliverydate` — `allowBlank: !handDelivery`
- `cps` (DVV checkbox) — `allowBlank: !cpsReceiving`
- `prefixcode` (BASIS Prefix) — `allowBlank: type !== 'b1'`
- Line Items grid — `allowBlank: false`, `isFormField: true` (unless nolines is checked)

### Advanced Validation (`advancedValidationIssues()`)
Runs before every non-draft submit. Checks in order:

1. **Discrepancy properly routed:** `previousDiscrepantProperlyRouted()` → else return `VALIDATION_MESSAGES.routeMustChange`
2. **Discrepant lines have reason:** `checkIfDiscrepantHaveAnyDiscLines()` → else return `VALIDATION_MESSAGES.missingDiscrepantReason`
3. **Line item required:** if `!lineItemExists() && !isNoLineItemReceiving()` → return `lineItemGrid.invalidReceivingValidationMsg`
4. **RPGHELD/Crypto box mismatch:** if `(validateBfheld || validateCrypto || totalBoxes > 0) && pieces !== totalBoxes` → different messages based on flag
5. **Box attribute DIM check:** if RPGHELD or Crypto, all box rows must have `length > 0 && width > 0 && height > 0 && weight > 0`
6. **Box pieces exist check (new receiving):** if pieces=1 and not nolines and not nobox and ≥1 line item received, auto-create box item
7. **Box/Piece info missing:** if pieces > 0 and not nobox and not nolines and no box pieces, return `VALIDATION_MESSAGES.boxPieceMissing`
8. **Box piece matching:** for each box number generated from piece count, check that at least one box item matches
9. **Line qty vs box qty mismatch:** each line item's `rec_qty` must equal sum of its box item quantities
10. **LOT bin check:** LOT-type lines must have `binnum` and `lotnum`
11. **Box does not exist:** if warehouse location and not nobox, check box numbers exist in received lines
12. **Asset info missing:** if received line has `rotating=YES` and `rec_qty > 0` and no `genesis_id`, asset items must be populated
13. **Previous receipt line check:** for non-new receivings, lines where `rl_id === null` with `rec_qty > 0` are flagged as not previously received
14. **Return line validation:** `checkReturnLines()` — returned lines must have `respoffcode`
15. **Blank reference number:** any reference number row with empty `referenceNumber` text

### Alert Messages (on form load)
- **Special Handling:** shown if `locUser && markPackShipMsg` — `Ext.Msg.alert('Special Handling', markPackShipMsg)`
- **Missing Room Number:** shown if `locUser && LocEhasNoRoomNumber()` — checks address for "LOCE" + "Room:" pattern
- **Mismatch Destination:** shown if `!locUser && shiptoaresid !== null && mismatchDestination()` — checks building/station match
- **Previous Discrepancies:** shown if `isAnyDiscrepant(previousReceipts) && isNewReceiving()` — alerts about existing discrepant receipts
- **Draft Receipts:** shown if `hasDraftReceipts() && !(received && draft)` — alerts about existing draft receipts
- **Previous Receipts (HAMMER-4641):** shown if `hasPreviousReceipts() && genesispoid === null && title does not contain 'Receipt'`
- **Aptic Receiving:** shown if `isApticReceiving() && !isAtLocBuildingD` — warns about Aptic receiving context
- **LOC Packing Required:** shown if `locPackingRequired` — "CLB Request LOC Packing"
- **Accountable Property:** shown if `rec.containsaccountableproperty` — "Contains Accountable Property"

---

## 11. Constants & Enums

### `INTERNAL_ROUTE`
| Key | Value | Meaning |
|---|---|---|
| `PSB` | `'PSB'` | Standard PSB route — disables bypass-box for non-LOC |
| `LOCAL_DELIVERY` | `'LOCAL_DELIVERY'` | Local delivery — enables package label printing |
| `LOCAL_ONLY` | `'LOCAL_ONLY'` | Local-only subset |
| `CUSTOMER_PICKUP` | `'CUSTOMER_PICKUP'` | Customer pickup — enables package label printing |
| `DISCREPANT` | `'DISCREPANT'` | Routes line items to discrepancy queue |
| `TFC` | `'TFC'` | Set automatically when LOC packing required (BASLOGS-20815) |

### `CARGO_STATUS`
| Key | Meaning |
|---|---|
| `DRAFT` | Package is a draft |
| `ONHAND` | Package is on hand; eligible for "mark delivered" |

### `LABEL_TYPE`
| Key | Meaning |
|---|---|
| `PACKAGE` | Package label |
| `OUTER` | Outer label (used in routing slip DELETE report types) |

### `WCS_SORT`
| Key | Meaning |
|---|---|
| `END` | End-of-sort sentinel for conveyor barcode |

### `LOGGING_COMPONENT`
| Key | Meaning |
|---|---|
| `RECEIVING` | Logging component ID passed to LoggingGrid |

### `HANDLING_PRIORITY_TYPES` (referenced but not defined in source)
Referenced as `HANDLING_PRIORITY_TYPES.IMMEDIATE` — if value matches, display "Immediate", otherwise "Routine" (HAMMER-6958, commented out in source).

### From MOS Options
Static array: `[{ id: 'SPF' }, { id: 'SAM' }]` — displayed only when `backhaul === '1'`.

### Tab Indices (keyboard navigation order)
```
receivedDate: 1
pieces: 3
weight: 4
noLineItemReceiving: 5
packingListProvided: 6
doNotSendToGenesis: 6
bypassBox: 7
handDelivery: 8
deliveredTo: 9
route: 12
carrier: 13
dvvReceiving: 14
basisPrefix: 15
refrigerationRequired: 16
freezingRequired: 17
rpgheld: 17
handDeliveredDate: 17
crypto: 18
remarks: 18
```

### Stores Required
| Store | Purpose |
|---|---|
| `Hammerhead.store.receiving.Receipts` | Receipts store |
| `Hammerhead.store.receiving.PreviousReceipts` | Previous receipts |
| `Hammerhead.store.receiving.Carriers` | Carrier lookup |
| `Hammerhead.store.receiving.PrefixCodes` | BASIS Prefix codes |
| `Hammerhead.store.receiving.BoxItems` | Box items |
| `Hammerhead.store.receiving.AssetItems` | Asset items |
| `Hammerhead.store.appfiles.AppFiles` | File attachments |
| `Hammerhead.store.shippingreference.WCSConveyorSpurs` | WCS conveyor spurs |
| `Hammerhead.store.Buildings` (wmaBuildingStore) | WMA buildings |
| `Hammerhead.shared.rackpickercontrol.RackPickerControlStore` | Rack picker |
| `Hammerhead.util.Lookups` → `'carrier'` | Carrier lookups |
| `Hammerhead.util.Lookups` → `'route'` | Route lookups (filtered) |

---

## 12. Conversion Notes

### What Has Been Converted

#### Files in `/src/app/createreceivingform/`

| File | Status | Notes |
|---|---|---|
| `page.tsx` | Partial | Stub data fetch hooks; does NOT connect to real API. Mock data hardcoded. Missing Axios calls. |
| `ReceivingTabPanel.tsx` | Structural (partial) | Tab structure diverges from ExtJS original (see Section 8). Special handling alert logic implemented. Previous receipts warning implemented. |
| `ShippingInformation.tsx` | Mostly complete | All display fields present. `containsconcealmentdvc` hardcoded to "NO" rather than reading from data. Missing `fromIncomingCargo`, `purpose` display in second column. |
| `NewReceivingForm.tsx` | Partial skeleton | Main fields laid out. All fields are `disabled` — not wired to real editable state. No conditional enable/disable logic. No `locUser`/`wmaUser` role-based visibility. Route/Carrier `Autocomplete` uses fake `['item1','item2','item3']` options — not wired to real stores. |
| `ReferenceTrackingGridController.tsx` + `ReferenceTrackingGrid.tsx` | Partial | Grid columns correct. Add/Remove toolbar buttons present but not fully wired. `handleProcessRowUpdate` commented out (needs Axios). Mobility tracking callback (`callMobility`) not implemented. |
| `BoxAttributesGridController.tsx` + `BoxAttributesGrid.tsx` | Partial | Columns correct (boxId, type, L/W/H/weight). Add/Remove/Add Multiple toolbar buttons present. Custom footer with totals not computing real values. `handleProcessRowUpdate` commented out. Validation (`checkBoxAttributes`) not implemented. |
| `LineItemsGridController.tsx` + `LineItemsGrid.tsx` | Partial | Columns correct. "Receive Balance Selected" and "Clear" toolbar buttons stubbed (no handlers). `handleProcessRowUpdate` commented out. Complex line-item validation not wired. |
| `PreviousReceiptsController.tsx` + `PreviousReceiptsGrid.tsx` | Mostly complete | All columns present. Discrepant row highlighting (blue chip) in footer but not applied to row cells. `recordselected` event (open view receiving) not wired. |
| `DraftReceiptsController.tsx` + `DraftReceiptsGrid.tsx` | Mostly complete | Mirrors previous receipts. Same notes apply. |

#### Files in `/src/extjs/ReceivingForm/`

| File | Status | Notes |
|---|---|---|
| `receivingFormConstants.ts` | Complete | All constants extracted: INTERNAL_ROUTE, CARGO_STATUS, LABEL_TYPE, WCS_SORT, LOGGING_COMPONENT, OPEN_VIEW_ACTIONS, MARK_PACK_SHIP_MESSAGES, TOOLBAR_ACTIONS, FROM_MOS_OPTIONS, FIELD_DEFAULTS, TAB_INDICES, VALIDATION_MESSAGES |
| `receivingFormTypes.ts` | Complete | All TypeScript interfaces and types extracted: ReceivingRecord, LineItem, BoxAttribute, BoxItem, AssetItem, ReferenceNumber, PreviousReceipt, Package, ReceivingFormState, ReceivingType, ReceivingFormMode, TrackingNumberPayload, BoxAttributePayload, ReceivingSubmitPayload, SaveReceivingResponse, TrackingLookupResult |
| `ReceivingFormController.tsx` | Skeleton only (first 100 lines visible) | Headless controller component exists with correct props interface. Internal implementation needs review. |

### What Still Needs to Be Done

#### Critical (blocking functionality)

1. **Real API integration** — Replace all mock `useFetchReceiving*` stubs in `page.tsx` with Axios calls:
   - `GET` to fetch the receiving record (URL TBD — not in the PDF, likely `receiving/movement/{id}` or similar)
   - `POST receiving/movement` for save/submit
   - `GET receiving/movements/delete?recId={id}` for cancel
   - `GET receiving/tracking/{refNum}` for mobility tracking

2. **Redux slice** — Create `receivingFormSlice` with record, flags, saveStatus. Connect `page.tsx` to dispatch and select.

3. **User role flags** — There is no user context in the Next.js app yet. Need to add `CurrentUser`-equivalent (Redux auth slice or React Context) supplying: `isLOCUser`, `isWMAUser`, `isFRANSUPTUser`, `isAtLocBuilding`, `isAtLocBuildingD`, `getPreference('showAptic')`, `getPreference('printReceivingLabel')`, `getCurrentBuilding()`, `getCurrentStation()`.

4. **`NewReceivingForm.tsx` enable/disable logic** — All fields are hardcoded to `disabled`. Need to implement:
   - `pieces` disable logic (complex, see Section 4)
   - `weight` disable logic
   - `route` enable logic (`routeIsEnabled()`)
   - `packing_slip_provided` disable logic
   - `nobox` disable/enable based on route
   - `nolines`, `cps`, `handdelivery`, `qty_adjustment_only` disable logic
   - `rcvrefrigerationreq`, `rcvfreezingreq`, `rcvbfheld`, `rcvcrypto` disable/hide based on `locUser`

5. **Real lookup stores for Route and Carrier** — `Autocomplete` in `NewReceivingForm.tsx` uses `['item1','item2','item3']`. Need to:
   - Fetch carriers from API
   - Fetch routes from API (with filtering logic — exclude PACKING for LOC users, exclude LOCAL_ONLY, filter by `allowPackages`, etc.)
   - Apply auto-selection logic on load

6. **Toolbar wiring** — `page.tsx` has toolbar buttons with empty `handleClick: () => {}`. Need to wire:
   - Submit → `onSave(false, false)` → `advancedValidationIssues()` → `POST receiving/movement`
   - Save As Draft → `onSave(false, true)`
   - Hand Receipt → `onSave(true, false)` + `receiptPrint`
   - Cancel Record → confirm → input comment → `GET delete` endpoint
   - View Audit Log → open audit log dialog/modal
   - Ordered Items → open ordered items dialog/modal
   - Print sub-menu → print functions
   - Delivered To Customer → `confirmDelivery`
   - Genesis PO button → link to Genesis PO

7. **Advanced validation** — `advancedValidationIssues()` in `ReceivingFormController.tsx` needs to be fully implemented and called before submit (see Section 10).

8. **`onLineItemUpdate`** — When line items change in the grid, `licount` and `lilist` fields in `NewReceivingForm.tsx` must update. This requires a shared state mechanism (Redux or callback prop).

9. **`onReferenceNumberEntered`** — Mobility tracking lookup (Axios GET + `parseLambdaDateTime` + update `receiveddate`). The `ReferenceTrackingGridController.tsx` needs to call this when a user enters a reference number.

10. **Box Attributes totals** — `CustomFooter` in `BoxAttributesGridController.tsx` shows labels but does not compute real totals from row data.

11. **`handleProcessRowUpdate`** — All three editable grids (ReferenceTracking, BoxAttributes, LineItems) have `handleProcessRowUpdate` commented out. These need Axios POST/PUT implementations.

#### Important (feature completeness)

12. **Processed Files tab** — `AppFilesGrid` equivalent not implemented. Needs a file upload/display grid.

13. **Logs & Comments tab** — `LoggingGrid` equivalent not implemented. Read-only audit log entries keyed by `receivingId`, `shippingOrderId`, `formattedSon`.

14. **Previous / Draft Receipts row click** — Clicking a row should fire `onOpenView({ viewToOpenId: VIEW_RECEIVING, data: params.data })`. The `PreviousReceiptsController` and `DraftReceiptsController` need an `onRowClick` handler that navigates or opens the receiving form for that record.

15. **Discrepant row highlighting** — Previous Receipts grid should highlight rows where `route === 'DISCREPANT'` in blue. Currently only a legend chip is shown.

16. **`nolines` → Line Items required mark** — When `nolines` is checked, the `fsLineItems` fieldset title should remove the required-mark asterisk. Currently no dynamic title update.

17. **`onHandDelivery` full wiring** — Hand delivery checkbox in `NewReceivingForm.tsx` toggles local state but does not enable/disable `deliverydate` and `deliveredTo` fields.

18. **`Bypass Box` conditional disable** — `nobox` checkbox must be disabled when route is not LOCAL_DELIVERY or CUSTOMER_PICKUP.

19. **`racklocation` field** — Not present in `NewReceivingForm.tsx`. Needs to be added (hidden for non-LOC/WMA unless aptic). Uses custom `racklocationfield` xtype with SON selection.

20. **Print functions** — All print operations currently have empty handlers. Needs:
    - `printLabel` → `controller.printReceivingLabels(...)`
    - `printRList` → `controller.printRoutingSlip(...)`
    - `printCPSpdf` → open URL `BASE_URL + 'print/pdf/cpsLabel.rpt?...'`
    - `receiptPrint` → open URL `/deliveryreceipt/handreceipt.rpt?...`
    - `printRecord` → open URL `BASE_URL + 'receiving/movement_detail.rpt?...'`
    - `doPrintBoxLabel` → decide between package labels and receiving label

21. **`clearDateTimeIn`** — When form loads for a new receiving as LOC user, `receiveddate` should be cleared.

22. **Startup notification alerts** — `notifyUserOfMissingRoomNumber`, `notifyUserOfMismatchDestination`, `notifyUserOfDraftReceipts`, `notifyUserOfApticReceiving`, `notifyUserOfLocPackingRequired`, `notifyUserOfAccountableProperty` all need to be triggered at load in `ReceivingTabPanel.tsx` or the controller.

23. **`doNotSendToGenesis` (`qty_adjustment_only`)** — Field missing from `NewReceivingForm.tsx`. Needs to be added for FRANSUPTU users.

24. **`frommos` (From MOS)** — Field not present. Needs to be added; shown only when `backhaul === '1'`.

25. **`isSubmitted` flag** — On save, `me.rec.set('isSubmitted', !openHandReceipt && !draft)` (HAMMER-5689). This must be included in the submit payload.

#### Architectural / Structural

26. **Tab structure alignment** — The Next.js vertical tab approach works well for UX but departs from the original single-scroll layout. Consider whether the product owner wants the UX to match the original more closely (all sections visible, scroll-based) or the tab-based approach. The current implementation is acceptable but not an exact match.

27. **`ReceivingFormController.tsx`** — This headless controller component in `/src/extjs/ReceivingForm/` overlaps with the page component and child components in `/src/app/createreceivingform/`. Decision needed: use the controller as the authoritative state/logic container and have the page just render it, or continue with the current page-based approach and delete/merge the controller.

28. **`DraftReceiptsController`** — `setRowModesModel` type mismatch: passes a setState setter but the grid expects a functional-updater signature. Needs reconciliation.

29. **`useApiUrl` and `useFetchShippingRegions`** — Stub functions in `BoxAttributesGridController.tsx` and `LineItemsGridController.tsx` need to be removed once real service hooks are created.

### ExtJS → MUI Equivalents Quick Reference

| ExtJS xtype | MUI/React Equivalent |
|---|---|
| `betterradiogroup` | `RadioGroup` + `FormControlLabel` + `Radio` (already in `NewReceivingForm.tsx`) |
| `lookupcombo` | `Autocomplete` + `TextField` |
| `combo` | `Autocomplete` or `Select` |
| `checkbox` | `Checkbox` + `FormControlLabel` |
| `datefield` | MUI X `DateTimePicker` / `DatePicker` (via `MyDatePicker` custom component) |
| `numberfield` | `TextField` with `type="number"` or `inputMode="numeric"` |
| `displayfield` | `TextField` with `disabled` or `InputBase` read-only |
| `textarea` | `TextField` with `multiline` prop |
| `fieldset` | MUI `Paper` or `Box` with `Typography` heading, or `Accordion` for collapsible |
| `tabpanel` | MUI `Tabs` + `Tab` + tab panel divs (already in `ReceivingTabPanel.tsx`) |
| `hint` (custom) | `Alert severity="info"` or `Typography` with icon (already via `HintBox` component) |
| `personfield` | Custom `Autocomplete` with LDAP search (already via `SearchField` component) |
| `racklocationfield` | Custom component (not yet built) |
| `genesispobutton` | `Button` with custom icon |
| `tbseparator` | MUI `Divider` |
| Toolbar | MUI `Toolbar` or `ButtonGroup` in `CustomToolbar` component |
| `Ext.Msg.alert` | MUI `Dialog` or `Snackbar` (via `WarningAlert` / `MySnackbar` custom components) |
| `Ext.Msg.confirm` | MUI `Dialog` with confirm/cancel buttons |
| `Ext.window.InputWindow` | MUI `Dialog` with `TextField` inside |
| Grid (`Ext.grid.Panel`) | MUI X `DataGrid` (already in use via `MyDataGrid`) |
| `Ext.Ajax.request` | Axios (`axios.post`, `axios.get`) |
| `Ext.LoadMask` | MUI `Backdrop` + `CircularProgress` (via `BackdropLoader` component) |
| `Ext.toast` | MUI `Snackbar` + `Alert` (via `MySnackbar`) |
| `Ext.Function.defer` | `setTimeout` |
| `me.rec.get(field)` | Redux `useSelector` + field access, or direct from props |
| `me.rec.set(field, val)` | Redux `dispatch(updateField({ field, value }))` |
| `Hammerhead.CurrentUser.*` | Auth context/slice selectors |
| `Hammerhead.util.Lookups` | API fetch + Redux store for lookup data |

---

*End of analysis. This document covers all 42 pages of the ExtJS PDF source and the 14 files in the current Next.js conversion.*
