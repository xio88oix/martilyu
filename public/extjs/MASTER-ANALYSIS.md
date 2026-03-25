# Receiving Module — Master Analysis Document

**Date**: 2026-03-25
**Source System**: Hammerhead (ExtJS)
**Conversion Target**: Next.js 14 App Router + MUI Material + Redux Toolkit + Axios
**Components Analyzed**: 7 ExtJS files (1 form + 6 grids)

---

## 1. Executive Summary

The Receiving Module is a comprehensive warehouse logistics data-entry system built in ExtJS. It enables staff to record the physical receipt of goods, manage line items, track assets, assign box/piece dimensions, and review historical receipts. The module centers on the **ReceivingForm** — a complex orchestrator component — surrounded by six specialized grid components that handle distinct data domains.

### Component Inventory

| Component | Class Name | Base Class | Role |
|---|---|---|---|
| **ReceivingForm** | `Hammerhead.view.receiving.ReceivingForm` | `Hammerhead.form.Base` | Main orchestrator form — state, validation, save/submit/cancel, toolbar, tabs |
| **ReceivingLineItemGrid** | `Hammerhead.grid.receiving.ReceivingLineItemGrid` | `Hammerhead.grid.CellField` | Editable grid for line-item receiving quantities, UOM, discrepancies, bins |
| **BoxAttributeGrid** | `Hammerhead.grid.receiving.BoxAttributeGrid` | `Hammerhead.grid.CellField` | Editable grid for box/piece physical dimensions (L/W/H/Weight) + Cubiscan integration |
| **BoxQuantityGrid** | `Hammerhead.grid.receiving.BoxQuantityGrid` | `Hammerhead.grid.GridField` | Editable grid for box number + quantity allocation per line item |
| **AssetItemGrid** | `Hammerhead.grid.receiving.AssetItemGrid` | `Hammerhead.grid.GridField` | Editable grid for asset serial numbers, conditions, barcodes + bulk upload |
| **AssetReceivedItemGrid** | `Hammerhead.grid.receiving.AssetReceivedItemGrid` | `Hammerhead.grid.GridField` | Read-only grid displaying received assets with return flag editing |
| **PreviousReceiptsGrid** | `Hammerhead.grid.receiving.PreviousReceiptsGrid` | `Hammerhead.grid.Base` | Read-only grid for historical/draft receipts with row expander detail |

---

## 2. Architecture Overview

### Component Hierarchy

```
ReceivingForm (orchestrator — state, handlers, validation)
├── Toolbar (receivingBar or receiptBar)
├── Shipping Information fieldset (read-only display)
│   └── Reference/Tracking Numbers grid (referencenumbergrid)
└── TabPanel
    ├── Tab 0: Shipping Information (also contains ReferenceTrackingGrid)
    ├── Tab 1: New Receiving / Receiving
    │   ├── Receiving Information fields (date, pieces, weight, route, carrier, etc.)
    │   ├── BoxAttributeGrid (collapsible, LOC users only)
    │   │   └── Opens BoxMultiple window for bulk-add
    │   └── ReceivingLineItemGrid
    │       ├── Opens BoxQuantityGrid (via BoxItems window) per line item
    │       ├── Opens AssetItemGrid (via AssetItems window) for rotating items
    │       └── Opens AssetReceivedItemGrid (via AssetReceivedItems window) for returns
    ├── Tab 2: PreviousReceiptsGrid (submitted receipts)
    ├── Tab 3: PreviousReceiptsGrid (draft receipts — same component, different store)
    ├── Tab 4: Processed Files (AppFilesGrid)
    └── Tab 5: Logs & Comments (LoggingGrid)
```

### Operating Modes

| Mode | Description |
|---|---|
| `editable: true` | Data-entry mode; shows `receivingBar` toolbar |
| `editable: false` | Read-only receipt view; shows `receiptBar` toolbar |
| `draft` (`status_id === 1`) | Saved as draft — partially editable |
| `received` (has `receivingid`) | Submitted record |
| `isPreviousReceipt` | Previously submitted record (status != null, status != 1) |

### Receiving Types

| Value | Meaning |
|---|---|
| `b1` | Standard BCS receiving |
| `b3` | CPS/DVV receiving |
| `b5` | Aptic receiving |

### User Role-Based Behavior

The form adapts significantly based on user roles:
- **LOC users** (`CurrentUser.isLOCUser()`): See box attributes, packing list, bypass box, route selection, refrigeration/freezing/crypto fields
- **WMA users** (`CurrentUser.isWMAUser()`): See rack location field
- **FRANSUPTU users** (`CurrentUser.isFRANSUPTUser()`): See "Do Not Send To Genesis" option
- **HH Lite** (`!LOC && !FRANSUPTU`): Simplified view with fewer fields

---

## 3. Data Model Summary

### Top-Level Record (ReceivingForm)

The form manages a rich record with 50+ fields including:
- **Identity**: `id`, `receivingid`, `sonid`, `son`, `ponum`, `genesispoid`
- **Status**: `status_id` (1=draft, 2=submitted), `draft`, `received`
- **Dates**: `receiveddate`, `dateout`, `datereqatdest`, `deliverydate`
- **Quantities**: `pieces`, `weight`, `licount`, `lilist`
- **Routing**: `route`, `carrier_id`, `prefixcode`
- **Flags**: `nolines`, `nobox`, `packing_slip_provided`, `handdelivery`, `cps`, `qty_adjustment_only`, `backhaul`
- **Hazmat/Special**: `containscrypto`, `containsweapons`, `containsammo`, `containsbfheld`, `containshazmat`, `containslithiumbatt`, `containsconcealmentdvc`, `refrigerationreq`, `freezingreq`
- **Collections**: `lineItems[]`, `boxAttributesIn[]`, `referenceNumbers[]`, `previousReceipts[]`, `draftReceipts[]`, `packages[]`

### LineItem Record (ReceivingLineItemGrid)

| Key Fields | Description |
|---|---|
| `rl_id` | Server-assigned receiving line ID |
| `line_number` | Line number |
| `linetype` | SERVICE, STDSERVICE, LOT, etc. |
| `rec_qty`, `orig_rec_qty` | Received / original received quantity |
| `ord_qty`, `ord_uom`, `rec_uom` | Ordered qty, ordered/received UOM |
| `disc_cargo` | Discrepancy cargo reason |
| `rotating` | YES/NO — asset-tracked item |
| `respoffcode` | Responsible office code (returns) |
| `binnum`, `lotnum` | Bin/lot assignment |
| `boxItems[]` | Box allocation per line |
| `assetItems[]` | Asset serial numbers |
| `conditioncode` | Condition code |

### BoxAttribute Record (BoxAttributeGrid)

| Field | Description |
|---|---|
| `boxId` | Box number (auto-incremented) |
| `boxType` | Box type code |
| `length`, `width`, `height` | Dimensions in inches |
| `weight` | Weight in pounds |

### BoxItem Record (BoxQuantityGrid)

| Field | Description |
|---|---|
| `r_lid` | Parent line item ID |
| `boxnum` | Box number (3-digit padded) |
| `quantity` | Quantity per box/piece |

### AssetItem Record (AssetItemGrid)

| Field | Description |
|---|---|
| `r_lid` | Parent line item ID |
| `serialnum` | Serial number (required, validated non-blank) |
| `conditioncode` | Condition code (combo) |
| `newpartnum` | New part number (conditional on discrepancy type) |
| `assetbarcode` | Asset barcode |
| `asset_comment` | Comment |

### AssetReceivedItem Record (AssetReceivedItemGrid)

| Field | Description |
|---|---|
| `r_lid` | Hidden line ID |
| `assetnum` | Asset number (read-only) |
| `serialnum` | Serial number (read-only) |
| `description` | Description (read-only) |
| `returnflag` | Y/N return flag (editable combo) |

---

## 4. Inter-Component Communication

### Event Flow

```
ReceivingLineItemGrid
  |-- fires 'update' event --> ReceivingForm (updates line item labels, dirty state)
  |-- opens BoxItems window --> BoxQuantityGrid
  |   '-- on 'submit' --> refreshBoxItems() on ReceivingLineItemGrid
  |-- opens AssetItems window --> AssetItemGrid
  |   '-- on 'submit' --> refreshAssetItems() on ReceivingLineItemGrid
  '-- opens AssetReceivedItems window --> AssetReceivedItemGrid
      '-- on 'submit' --> refreshAssetReceivedItems() on ReceivingLineItemGrid

BoxAttributeGrid
  |-- fires 'validitychange' --> ReceivingForm (form validation)
  |-- fires 'errorchange' --> ReceivingForm (error display)
  '-- opens BoxMultiple window --> update() callback creates multiple box records

PreviousReceiptsGrid
  |-- fires 'recordselected' --> ReceivingForm controller (opens receipt detail)
  '-- AJAX fetch on row expand --> buildLineItemString() (inline HTML)
```

### Parent-Child Data Passing

All grids receive configuration from the parent form/window:
- `received` (boolean) — controls editability across all grids
- `cpsReceiving` — CPS/DVV mode flag
- `draft` — draft mode flag
- `existingDiscrepant` — discrepancy state
- `line_id` — parent line item ID (for BoxQuantityGrid, AssetItemGrid, AssetReceivedItemGrid)

### Shared Stores

| Store | Used By |
|---|---|
| `receiving.Conditions` | AssetItemGrid, AssetReceivedItemGrid, BoxAttributeGrid |
| `receiving.ReceivingLineItems` | ReceivingLineItemGrid |
| `receiving.BoxAttributes` | BoxAttributeGrid |
| `receiving.Discrepancies` | ReceivingLineItemGrid |
| `receiving.RespOffCodes` | ReceivingLineItemGrid |
| `receiving.StoreLoc` | ReceivingLineItemGrid |
| `receiving.Bins` | ReceivingLineItemGrid |
| `receiving.OrderedItems` | AssetItemGrid |

---

## 5. Business Logic Summary

### Validation Rules

| Component | Rule | Description |
|---|---|---|
| ReceivingForm | `advancedValidationIssues()` | Pre-submit validation — checks all field requirements |
| ReceivingForm | Pieces field disable logic | Complex rule based on receiving type, user role, route, draft state |
| ReceivingLineItemGrid | `hasAnyValidLineItem()` | At least one line item must have `rec_qty > 0` (unless nolines override) |
| ReceivingLineItemGrid | `hasBoxPieces()` | Lines with `rec_qty > 0` must have box items assigned |
| ReceivingLineItemGrid | `hasReceivedLines()` | Counts lines with received quantities |
| ReceivingLineItemGrid | `recQtyValidator()` | Received qty must be > 0 or empty; special rules for discrepant returns |
| BoxAttributeGrid | `isValid()` / `validateValue()` | All dimension/weight fields must be filled (unless `allowBlank`) |
| BoxQuantityGrid | `checkValid()` | Sum of all box quantities must equal parent `rec_qty` |
| AssetItemGrid | Serial number validation | Cannot be blank; checked before adding new rows |

### Key Workflows

#### Save/Submit Flow
1. Check tracking number editing state
2. Validate no empty reference numbers
3. Run `advancedValidationIssues()` (submit only)
4. Update record from form fields
5. Map reference numbers and box attributes to payload
6. `POST /receiving/movement`
7. On success: update ID, show packages, trigger print, fire `viewReceiving`

#### Bulk Discrepancy Application
1. Click bulk discrepancy icon on ReceivingLineItemGrid
2. Select discrepancy code from ApplyBulkDiscrepancy window
3. Applied to ALL line items in the grid
4. Updates unit of measure and line item labels

#### Auto Create Boxes (BoxQuantityGrid)
1. Enter default quantity per box
2. Click "Auto Create Boxes"
3. Creates N box records (one per piece) with padded box numbers and default qty

#### Bulk Asset Upload (AssetItemGrid)
1. Click "Add Bulk" button
2. BulkUploadWindow opens with CSV template
3. Upload CSV file to `/receiving/bulkassetupload`
4. On complete, fetch uploaded assets and populate grid

#### Label Reprinting (BoxQuantityGrid)
1. Select boxes via checkbox
2. Enter copies count
3. Validates total quantities match
4. Generates PDF label via `/print/pdf/cpsLabel.rpt`

#### Cubiscan Integration (BoxAttributeGrid)
- Hardware integration for automatic dimension/weight capture
- CubiscanField custom control fires `measurementreceived` event
- Validates measurement units are in inches
- Applies measurements to all selected rows

---

## 6. API Endpoints

All URLs relative to `Hammerhead.data.BASE_URL`:

| Method | Endpoint | Component | Purpose |
|---|---|---|---|
| POST | `receiving/movement` | ReceivingForm | Save/submit receiving record |
| GET | `receiving/movements/delete?recId={id}&comment={comment}` | ReceivingForm | Cancel receiving record |
| GET | `receiving/previous/receipt_lines?receivingid={id}&son={son}` | PreviousReceiptsGrid | Fetch line-item detail for row expander |
| POST | `receiving/bulkassetupload` | AssetItemGrid | Bulk upload assets via CSV |
| GET | `receiving/assetsfromupload.json` | AssetItemGrid | Retrieve uploaded assets after bulk upload |
| GET | `print/pdf/cpsLabel.rpt?...` | BoxQuantityGrid | Generate PDF label for reprinting |

---

## 7. Grid Feature Comparison

| Feature | LineItemGrid | BoxAttributeGrid | BoxQuantityGrid | AssetItemGrid | AssetReceivedItemGrid | PreviousReceiptsGrid |
|---|---|---|---|---|---|---|
| **Base Class** | CellField | CellField | GridField | GridField | GridField | Base |
| **Editing** | Cell editing | Cell editing | Row editing | Row editing | Cell (1 col) | Read-only |
| **Add/Remove** | Inherited | Yes | Yes | Yes | No | No |
| **Selection Model** | Checkbox (MULTI) | Checkbox (MULTI) | Checkbox (MULTI) | Inherited | Inherited | None |
| **Row Expander** | Yes (detail template) | No | No | No | No | Yes (AJAX detail) |
| **Summary Row** | No | Yes (bottom dock) | No | No | No | No |
| **Bulk Operations** | Receive All, Return All, Bulk Discrepancy | Add Multiple, Cubiscan | Auto Create Boxes, Reprint Label | Add Bulk (CSV upload) | No | No |
| **Validation** | Qty, boxes, discrepancy | Dimensions required | Qty sum = rec_qty | Serial # required | No | No |
| **Custom Events** | `update` | `validitychange`, `errorchange` | None | None | None | `recordselected` |
| **Windows/Dialogs** | BoxItems, AssetItems, AssetReceivedItems, InputWindow, RespOffCode | BoxMultiple | None | BulkUploadWindow | None | None |

---

## 8. Code Quality Observations

### Cross-Cutting Issues

| Issue | Severity | Components Affected | Description |
|---|---|---|---|
| No MVVM pattern | Info | All | All components use imperative data flow rather than ExtJS MVVM bind/ViewModel. Consistent but makes state tracking harder. |
| Tight parent coupling | Medium | All grids | Grids use `this.up('receivingform')` and direct parent form manipulation. Tight coupling to component hierarchy. |
| Fragile toolbar access | High | AssetItemGrid, BoxQuantityGrid | Positional access via `getDockedComponent(1).getComponent(N)` — breaks if toolbar layout changes |
| Unused store references | Low | AssetReceivedItemGrid | `receiving.Conditions` store retrieved but not consumed in visible code |
| Missing `#` in CSS color | Low | PreviousReceiptsGrid | `getBgColor()` returns `"background-color:dae3f5"` missing `#` prefix |
| Typo in property name | Low | ReceivingLineItemGrid | `me.exisitingDiscrepant` (should be `existingDiscrepant`) |
| Brittle string matching | Low | PreviousReceiptsGrid | `isDraftReceipts()` checks parent title with trailing space — fragile |
| Commented-out code | Low | BoxQuantityGrid | Non-PDF print path entirely commented out |
| Missing error handling | Medium | AssetItemGrid | Bulk upload AJAX callback lacks error handling |
| No explicit `destroy` | Info | All grids | No cleanup overrides — relies on framework automatic cleanup |

### Positive Patterns

- Consistent use of `callParent(arguments)` across all components
- Proper selection model configuration with `checkOnly` and `allowDeselect`
- Grid editability properly gated by `received` state flag in all components
- `deferEmptyText: false` used consistently for immediate user feedback
- Summary row feature used appropriately in BoxAttributeGrid
- Form validation events (`validitychange`, `errorchange`) properly implemented in BoxAttributeGrid

---

## 9. Conversion Considerations for Next.js

### Component Mapping

| ExtJS Component | Next.js Equivalent |
|---|---|
| `ReceivingForm` | React component with Redux Toolkit state + form management |
| `ReceivingLineItemGrid` | MUI X DataGrid with cell editing |
| `BoxAttributeGrid` | MUI X DataGrid with cell editing + custom validation |
| `BoxQuantityGrid` | MUI X DataGrid with row editing |
| `AssetItemGrid` | MUI X DataGrid with row editing |
| `AssetReceivedItemGrid` | MUI X DataGrid (mostly read-only) |
| `PreviousReceiptsGrid` | MUI X DataGrid with detail panel (row expand) |
| `Ext.window.*` | MUI Dialog components |
| `Ext.tip.ToolTip` | MUI Tooltip |
| `Ext.selection.CheckboxModel` | DataGrid `checkboxSelection` prop |
| Stores | Redux Toolkit slices + RTK Query or Axios hooks |
| `CubiscanField` | Custom React component with WebSocket/API integration |

### Key Challenges

1. **Complex conditional field visibility/editability**: The form has 20+ fields with role-based and state-based visibility/editability rules. Needs a clean state derivation layer.

2. **Nested grid windows**: LineItemGrid opens child windows containing BoxQuantityGrid and AssetItemGrid. In React, these become Dialog components with their own DataGrid instances.

3. **Bulk operations**: Receive All, Return All, Bulk Discrepancy, Auto Create Boxes — all involve iterating store records and applying changes. Need Redux actions or DataGrid API manipulation.

4. **Cell-level editing with validation**: LineItemGrid has complex per-cell editing rules (e.g., certain columns only editable based on line type, received state, discrepancy type). MUI X DataGrid supports this via `isCellEditable` callback.

5. **Cubiscan hardware integration**: BoxAttributeGrid integrates with physical measurement hardware. Needs a WebSocket or polling-based React implementation.

6. **Label printing**: BoxQuantityGrid generates PDF labels. Can be handled with URL-based PDF generation (same pattern).

7. **Row expander with AJAX**: PreviousReceiptsGrid loads detail on expand via AJAX. MUI X DataGrid Pro supports detail panels with lazy loading.

8. **Form validation cascade**: BoxAttributeGrid acts as a form field with `isValid()`, `getErrors()`, and fires `validitychange`. Need custom form-field-like validation wrapper for the DataGrid.

### Recommended File Structure

```
src/app/receiving/
├── page.tsx                          # Route entry point
├── ReceivingForm.tsx                 # Main form orchestrator
├── components/
│   ├── ShippingInformation.tsx       # Read-only shipping info fieldset
│   ├── ReceivingInformation.tsx      # Editable receiving fields
│   ├── ReceivingLineItemGrid.tsx     # Line items DataGrid
│   ├── BoxAttributeGrid.tsx          # Box dimensions DataGrid
│   ├── BoxQuantityDialog.tsx         # Dialog containing BoxQuantityGrid
│   ├── BoxQuantityGrid.tsx           # Box qty allocation DataGrid
│   ├── AssetItemDialog.tsx           # Dialog containing AssetItemGrid
│   ├── AssetItemGrid.tsx             # Asset tracking DataGrid
│   ├── AssetReceivedItemDialog.tsx   # Dialog containing AssetReceivedItemGrid
│   ├── AssetReceivedItemGrid.tsx     # Received assets DataGrid
│   ├── PreviousReceiptsGrid.tsx      # Historical receipts DataGrid
│   ├── ReferenceTrackingGrid.tsx     # Reference numbers DataGrid
│   └── ReceivingTabPanel.tsx         # Tab layout
├── hooks/
│   ├── useReceivingForm.ts           # Form state + validation logic
│   ├── useReceivingLineItems.ts      # Line item business logic
│   └── useCubiscan.ts               # Cubiscan hardware integration
├── store/
│   └── receivingSlice.ts             # Redux Toolkit slice
├── types/
│   └── receiving.ts                  # TypeScript interfaces
└── utils/
    ├── validation.ts                 # Validation rules
    └── formatting.ts                 # Box number padding, date formatting
```

---

## 10. Individual Analysis References

Each component has a detailed analysis file with full method documentation, events, lifecycle analysis, dependencies, code quality assessment, and recommendations:

| Component | Analysis File | Size |
|---|---|---|
| ReceivingForm | [`ReceivingForm-analysis.md`](./ReceivingForm-analysis.md) | 54 KB |
| ReceivingLineItemGrid | [`ReceivingLineItemGrid-analysis.md`](./ReceivingLineItemGrid-analysis.md) | 30 KB |
| BoxQuantityGrid | [`BoxQuantityGrid-analysis.md`](./BoxQuantityGrid-analysis.md) | 21 KB |
| AssetItemGrid | [`AssetItemGrid-analysis.md`](./AssetItemGrid-analysis.md) | 21 KB |
| PreviousReceiptsGrid | [`PreviousReceiptsGrid-analysis.md`](./PreviousReceiptsGrid-analysis.md) | 20 KB |
| BoxAttributeGrid | [`BoxAttributeGrid-analysis.md`](./BoxAttributeGrid-analysis.md) | 17 KB |
| AssetReceivedItemGrid | [`AssetReceivedItemGrid-analysis.md`](./AssetReceivedItemGrid-analysis.md) | 13 KB |
