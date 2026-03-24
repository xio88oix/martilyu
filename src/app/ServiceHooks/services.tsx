'use client';

/**
 * Service Hooks - Auto-generated stubs from API documentation
 * Generated: 2026-03-22
 *
 * These are stub implementations using mock data.
 * Replace mock data and stub logic with real API calls when ready.
 *
 * Base URL: https://dev.hammerhead.cia/hammerhead
 */

import { useEffect, useState } from 'react';

// ============================================================
// Shared / Common Types
// ============================================================

export interface LookupStatus {
  active: boolean;
  completed: boolean;
  id: number;
  longDescription: string;
  shortDescription: string;
  submitted: boolean;
}

export interface CubiscanType {
  databaseLocation: string | null;
  id: number;
  longDescription: string;
  selectBySonSQL: string | null;
  selectSQL: string | null;
  shortDescription: string;
  updateSQL: string | null;
}

export interface CubiscanLocation {
  active: boolean;
  cubiscanType: CubiscanType;
  id: number;
  ipAddress: string;
  longDescription: string;
  shortDescription: string;
}

// ============================================================
// Buildings
// ============================================================

export interface Building {
  buildingCode: string;
  locb: boolean;
  count: number;
  buildingName: string;
  id: number;
}

export interface BuildingsResponse {
  count: number;
  data: Building[];
}

const mockBuildingsResponse: BuildingsResponse = {
  count: 227,
  data: [
    {
      buildingCode: 'XXXX',
      locb: false,
      count: 227,
      buildingName: '9 PARKING LT',
      id: 900009999,
    },
  ],
};

// Legacy mock kept for backward compatibility with useFetchBuildings
const MOCK_BUILDINGS = [
  { id: 1, buildingName: 'Main Building' },
  { id: 2, buildingName: 'Annex A' },
  { id: 3, buildingName: 'Warehouse' },
  { id: 4, buildingName: 'North Campus' },
];

// ============================================================
// User
// ============================================================

export interface Station {
  id: number;
  stationName: string;
  stationNumber: string;
  active: boolean;
}

const MOCK_STATION = {
  id: 9,
  stationName: 'XOC',
  stationNumber: "0903",
  active: true,
}

export interface User {
  displayName: string;
  roles: string[];
  rolesAsString: string;
  preferencesAsJson: string;
  currentStation: Station | null;
  currentBuilding: Building | null;
  defaultTabToOpen: string | null;
  locuser: boolean;
  enterpriseLocationId: number;
}

const MOCK_USER: User = {
  displayName: 'John Doe',
  roles: ['Admin', 'User', 'Developer'],
  rolesAsString: "'Admin', 'User', 'Developer'",
  preferencesAsJson: '{ "printReceivingLabel": "true", "showAptic": "true", "wmaUser": "true", "notifications": true }',
  currentStation: MOCK_STATION,
  currentBuilding: null,
  defaultTabToOpen: null,
  locuser: true,
  enterpriseLocationId: 12345,
};

/**
 * Stubs GET user.json
 */
export function useFetchUserData() {
  const [userData, setUserData] = useState<User | null>(null);
  const [userDataLoading, setUserDataLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setUserData(MOCK_USER);
      setUserDataLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return { userData, userDataLoading };
}

/**
 * Stubs GET buildings.json
 * Returns a paginated list of buildings.
 */
export function useFetchBuildings() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [buildingsLoading, setBuildingsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setBuildings(MOCK_BUILDINGS);
      setBuildingsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return { buildings, buildingsLoading };
}

/**
 * Stubs GET buildings.json
 * Returns a typed paginated list of buildings with count.
 */
export function useGetBuildings() {
  const [data] = useState<BuildingsResponse>(mockBuildingsResponse);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return { data, loading, error };
}

// ============================================================
// Receiving Movements (List)
// ============================================================

export interface ReceivingMovementsPayload {
  _dc: number;
  filter: string;
  type: string;
  numberType: number;
}

export interface MovementStatus {
  active: boolean;
  completed: boolean;
  id: number;
  longDescription: string;
  shortDescription: string;
  submitted: boolean;
}

export interface ReceivingMovement {
  refrigerationReq: boolean;
  receiver: string | null;
  freezingReq: boolean;
  count: number;
  shippingOrderId: number;
  containsWeapons: boolean;
  son: string;
  route: string | null;
  statusId: number;
  referenceNumber: string | null;
  bscDocNumber: string | null;
  containsHazmat: boolean;
  finalDestinationName: string;
  receivedTime: string | null;
  locPackingRequired: string | null;
  id: number;
  containsAmmo: boolean;
  poNumber: string | null;
  receivedDate: string | null;
  lilist: string | null;
  status: MovementStatus;
}

export interface ReceivingMovementsResponse {
  count: number;
  data: ReceivingMovement[];
}

const mockReceivingMovementsResponse: ReceivingMovementsResponse = {
  count: 1,
  data: [
    {
      refrigerationReq: false,
      receiver: null,
      freezingReq: false,
      count: 1,
      shippingOrderId: 1019313,
      containsWeapons: false,
      son: '01187893',
      route: null,
      statusId: 2,
      referenceNumber: null,
      bscDocNumber: null,
      containsHazmat: false,
      finalDestinationName: 'FRANSUPT - 0679',
      receivedTime: null,
      locPackingRequired: null,
      id: 9019313,
      containsAmmo: false,
      poNumber: null,
      receivedDate: null,
      lilist: null,
      status: {
        active: true,
        completed: false,
        id: 2,
        longDescription: 'Submitted',
        shortDescription: 'Submitted',
        submitted: true,
      },
    },
  ],
};

/**
 * Stubs GET /receiving/movements
 * Returns a filtered list of receiving movements.
 */
export function useGetReceivingMovements(payload?: ReceivingMovementsPayload) {
  const [data] = useState<ReceivingMovementsResponse>(mockReceivingMovementsResponse);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return { data, loading, error };
}

// ============================================================
// Receiving Movement (Detail)
// ============================================================

export interface ReceivingMovementPayload {
  _dc: number;
  receivingid: number;
  receiveddate?: string;
  son: string;
  ponum?: string;
  packageId?: string;
}

export interface LineItemBoxItem {
  r_l_id: number;
  boxnum: string;
  quantity: number;
  id: string | null;
  rbox_id: string | null;
}

export interface LineItem {
  rotating: string | null;
  qty_due: number;
  total_qty_received: number | null;
  rec_uom_desc: string | null;
  receiptscomplete: number;
  linetype: string;
  lotnum: string | null;
  nsn: string | null;
  description: string;
  syscomments: string;
  assetItems: any[];
  respoffcode: string | null;
  line_id: number;
  transactiontype: string;
  receiveddate: string | null;
  genesis_id: number;
  partnum: string;
  manufacturer: string;
  ord_qty: number;
  boxnum: string | null;
  polinecomment: string;
  line_number: number;
  pack_nbr: string;
  rec_uom: string | null;
  orig_rec_qty: number;
  conditioncode: string | null;
  clin: string | null;
  comments: string;
  storeloc: string;
  modelnum: string;
  genesis_line: number;
  binnum: string | null;
  enteredby: string;
  lottype: string | null;
  venddeliverydate: string | null;
  boxItems: LineItemBoxItem[];
  discrepancy: string | null;
  extendeddescription: string;
  rec_qty: number | null;
  rl_id: string | null;
  disc_cargo: string | null;
  ord_uom: string;
}

export interface ReceivingMovementDetailResponse {
  data: {
    indicator: string | null;
    containsammo: string;
    final_destination: string;
    qty_adjustment_only: string | null;
    deliverydate: Date | null;
    lineItems: LineItem[];
    genesis: number | null;
    son: string;
    status_id: number | null;
    handling_priority_type_id: number | null;
    allow_packages: string;
    rcvfreezingreq: string;
    id: number | null;
    tireq: string;
    receivingid: number | null;
    refrigerationreq: string;
    taskreceivepieces: string | null;
    draftReceipts: any[];
    packing_slip_provided: string | null;
    sonmaxboxid: number;
    secureshipmentreq: string;
    nolines: string;
    sonid: number;
    datereqatdest: Date | null;
    cps: string;
    rcvbfheld: string;
    nobox: string;
    weight: number | null;
    trackingNumbers: any[];
    satellite_location: string | null;
    received: number | null;
    containscrypto: string;
    rcvrefrigerationreq: string;
    receiving_completed: string;
    taskutility: string | null;
    route: number | null;
    previousReceipts: any[];
    containslithiumbatt: string;
    containsconcealmentdvc: string;
    boxid: number | null;
    markpackship: string | null;
    backhaul: string;
    purpose: string | null;
    licount: number | null;
    freezingreq: string;
    containsweapons: string;
    taskstatusid: number | null;
    receiveddate: Date | null;
    pieces: number | null;
    carrier_id: number | null;
    esmtid: number | null;
    draftmaxboxid: number;
    handdelivery: string;
    receivedfromincomincomingcargo: string | null;
    containshazmat: string;
    track: string | null;
    genesispoid: number | null;
    prefixcode: string | null;
    lilist: string | null;
    shiptoname: string | null;
    boxAttributes: any[];
    rack: string | null;
    address: string | null;
    boxIds: number[];
    dateout: Date | null;
    rtid: number | null;
    packageId: number | null;
    bscdocnumber: string | null;
    shiptoaresid: string | null;
    containsAccountableProperty: boolean;
    lptsid: number | null;
    carrier: string | null;
    taskpackages: string | null;
    shiptostationid: number | null;
    cubiscanLocation: CubiscanLocation;
    ponum: string | null;
    son_handling_priority_type_id: number | null;
    assetReceivedItems: any[];
    rcvcrypto: string;
    sotypeid: number;
    tasktypeid: number | null;
    remarks: string | null;
    deliveryrecipient: string | null;
    containsbfheld: string;
  };
}

const mockReceivingMovementDetail: ReceivingMovementDetailResponse = {
  data: {
    indicator: null,
    containsammo: 'NO',
    final_destination: '0679',
    qty_adjustment_only: null,
    deliverydate: null,
    lineItems: [
      {
        rotating: null,
        qty_due: 100.0,
        total_qty_received: null,
        rec_uom_desc: null,
        receiptscomplete: 0,
        linetype: ' ',
        lotnum: null,
        nsn: null,
        description: 'line 1',
        syscomments: ' ',
        assetItems: [],
        respoffcode: null,
        line_id: 3850862,
        transactiontype: ' ',
        receiveddate: null,
        genesis_id: 0,
        partnum: ' ',
        manufacturer: ' ',
        ord_qty: 100,
        boxnum: null,
        polinecomment: ' ',
        line_number: 1,
        pack_nbr: ' ',
        rec_uom: null,
        orig_rec_qty: 0.0,
        conditioncode: null,
        clin: null,
        comments: ' ',
        storeloc: ' ',
        modelnum: ' ',
        genesis_line: 0,
        binnum: null,
        enteredby: ' ',
        lottype: null,
        venddeliverydate: null,
        boxItems: [],
        discrepancy: null,
        extendeddescription: ' ',
        rec_qty: null,
        rl_id: null,
        disc_cargo: null,
        ord_uom: 'BOX',
      },
    ],
    genesis: null,
    son: '01187893',
    status_id: null,
    handling_priority_type_id: null,
    allow_packages: 'Y',
    rcvfreezingreq: '0',
    id: null,
    tireq: 'No',
    receivingid: null,
    refrigerationreq: 'NO',
    taskreceivepieces: null,
    draftReceipts: [],
    packing_slip_provided: null,
    sonmaxboxid: 0,
    secureshipmentreq: 'NO',
    nolines: '0',
    sonid: 1019313,
    datereqatdest: null,
    cps: '0',
    rcvbfheld: '0',
    nobox: '0',
    weight: null,
    trackingNumbers: [],
    satellite_location: null,
    received: null,
    containscrypto: 'NO',
    rcvrefrigerationreq: '0',
    receiving_completed: '0',
    taskutility: null,
    route: 12,
    previousReceipts: [],
    containslithiumbatt: 'NO',
    containsconcealmentdvc: 'NO',
    boxid: null,
    markpackship: null,
    backhaul: '0',
    purpose: null,
    licount: null,
    freezingreq: 'NO',
    containsweapons: 'NO',
    taskstatusid: null,
    receiveddate: new Date(1773912090000),
    pieces: null,
    carrier_id: null,
    esmtid: null,
    draftmaxboxid: 0,
    handdelivery: '0',
    receivedfromincomincomingcargo: null,
    containshazmat: 'NO',
    track: null,
    genesispoid: null,
    prefixcode: null,
    lilist: null,
    shiptoname: null,
    boxAttributes: [],
    rack: null,
    address: null,
    boxIds: [1066815],
    dateout: new Date(1773912090000),
    rtid: null,
    packageId: null,
    bscdocnumber: null,
    shiptoaresid: null,
    containsAccountableProperty: false,
    lptsid: null,
    carrier: null,
    taskpackages: null,
    shiptostationid: null,
    cubiscanLocation: {
      active: true,
      cubiscanType: {
        databaseLocation: null,
        id: 10,
        longDescription: 'Cubiscans Located at Packing Area',
        selectBySonSQL: null,
        selectSQL: null,
        shortDescription: 'Packing',
        updateSQL: null,
      },
      id: 22,
      ipAddress: '10.50.128.89',
      longDescription: 'Cubiscan at Pack Line 1',
      shortDescription: 'Pack Line 1',
    },
    ponum: null,
    son_handling_priority_type_id: null,
    assetReceivedItems: [],
    rcvcrypto: '0',
    sotypeid: 0,
    tasktypeid: null,
    remarks: null,
    deliveryrecipient: null,
    containsbfheld: 'NO',
  },
};

/**
 * Stubs GET /receiving/movement
 * Returns the full detail of a single receiving movement by receivingid/son.
 */
export function useGetReceivingMovement(payload?: ReceivingMovementPayload) {
  const [data] = useState<ReceivingMovementDetailResponse>(mockReceivingMovementDetail);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return { data, loading, error };
}

// ============================================================
// Submit Receiving Movement (POST)
// ============================================================

export interface SubmitReceivingMovementPayload {
  indicator: string | null;
  containsammo: string;
  final_destination: string;
  qty_adjustment_only: boolean;
  deliverydate: string | null;
  genesis: string | null;
  son: string;
  status_id: string | null;
  handling_priority_type_id: string | null;
  allow_packages: string;
  rcvfreezingreq: boolean;
  id: number;
  tireq: string;
  receivingid: string | null;
  refrigerationreq: string;
  taskreceivepieces: string | null;
  draftReceipts: any[];
  packing_slip_provided: boolean;
  sonmaxboxid: number;
  secureshipmentreq: string;
  nolines: boolean;
  sonid: number;
  datereqatdest: string | null;
  cps: boolean;
  rcvbfheld: boolean;
  nobox: boolean;
  weight: number;
  trackingNumbers: any[];
  satellite_location: string | null;
  received: string | null;
  containscrypto: string;
  rcvrefrigerationreq: boolean;
  receiving_completed: boolean;
  taskutility: string | null;
  route: number;
  previousReceipts: any[];
  containslithiumbatt: string;
  containsconcealmentdvc: string;
  boxid: string | null;
  markpackship: string | null;
  backhaul: string;
  purpose: string | null;
  licount: string | null;
  freezingreq: string;
  containsweapons: string;
  taskstatusid: string | null;
  receiveddate: string;
  pieces: number;
  carrier_id: string | null;
  esmtid: string | null;
  draftmaxboxid: number;
  handdelivery: boolean;
  receivedfromincomincomingcargo: string | null;
  containshazmat: string;
  track: string | null;
  genesispoid: string | null;
  prefixcode: string | null;
  lilist: string | null;
  shiptoname: string | null;
  boxAttributes: any[];
  rack: string | null;
  address: string | null;
  boxIds: number[];
  dateout: string;
  rtid: string | null;
  packageId: string | null;
  bscdocnumber: string | null;
  shiptoaresid: string | null;
  containsAccountableProperty: boolean;
  lptsid: string | null;
  carrier: string | null;
  taskpackages: string | null;
  shiptostationid: string | null;
  cubiscanLocation: CubiscanLocation;
  ponum: string | null;
  son_handling_priority_type_id: string | null;
  assetReceivedItems: any[];
  rcvcrypto: string;
  sotypeid: number;
  tasktypeid: string | null;
  remarks: string;
  deliveryrecipient: string;
  containsbfheld: string;
  routingId: string | null;
  frommos: string | null;
  handlingPriorityType: string | null;
  rackLocationChange: string | null;
  packages: string | null;
  draft: boolean;
  secureShipmentReq: string | null;
  rackField: string | null;
  locPackingRequired: string | null;
  routingneeded: boolean;
  aptic: boolean;
  rackOfficerId: string | null;
  rackList: string;
  rackComment: string;
  isSubmitted: boolean;
  lines: SubmitLineItem[];
}

export interface SubmitLineItemBoxItem {
  r_l_id: number;
  boxnum: string;
  quantity: number;
  id: string | null;
  rbox_id: string | null;
}

export interface SubmitLineItem {
  rotating: string;
  qty_due: number;
  total_qty_received: number | null;
  rec_uom_desc: string | null;
  receiptscomplete: number;
  linetype: string;
  lotnum: string | null;
  nsn: string | null;
  description: string;
  syscomments: string;
  assetItems: any[];
  respoffcode: string | null;
  line_id: number;
  transactiontype: string;
  receiveddate: string;
  genesis_id: number;
  partnum: string;
  manufacturer: string;
  ord_qty: number;
  boxnum: string | null;
  polinecomment: string;
  line_number: number;
  pack_nbr: string;
  rec_uom: number;
  orig_rec_qty: number;
  conditioncode: string | null;
  clin: string | null;
  comments: string;
  storeloc: string;
  modelnum: string;
  genesis_line: number;
  binnum: string | null;
  enteredby: string;
  lottype: string | null;
  venddeliverydate: string | null;
  boxItems: SubmitLineItemBoxItem[];
  discrepancy: string | null;
  extendeddescription: string;
  rec_qty: number;
  rl_id: string | null;
  disc_cargo: string | null;
  ord_uom: string;
  assetReceivedItems: string | null;
  id: string | null;
}

export interface SubmitReceivingMovementResponse {
  id: number;
}

const mockSubmitReceivingMovementResponse: SubmitReceivingMovementResponse = {
  id: 1138014,
};

/**
 * Stubs POST /receiving/movement
 * Submits a receiving movement and returns the created record id.
 */
export function useSubmitReceivingMovement(payload?: SubmitReceivingMovementPayload) {
  const [data] = useState<SubmitReceivingMovementResponse>(mockSubmitReceivingMovementResponse);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return { data, loading, error };
}

// ============================================================
// Lookups - App Log Level
// ============================================================

export interface AppLogLevelPayload {
  _dc: number;
  type: 'appLogLevel';
  activeOnly: boolean;
  page: number;
  start: number;
  limit: number;
}

export interface AppLogLevel {
  active: boolean;
  id: number;
  longDescription: string;
  shortDescription: string;
}

export interface AppLogLevelResponse {
  count: number;
  data: AppLogLevel[];
}

const mockAppLogLevelResponse: AppLogLevelResponse = {
  count: 6,
  data: [
    {
      active: true,
      id: 1,
      longDescription: 'Only administrators can see these notifications',
      shortDescription: 'Admin',
    },
  ],
};

/**
 * Stubs GET /lookups.json?type=appLogLevel
 * Returns available application log level lookup values.
 */
export function useGetAppLogLevels(payload?: AppLogLevelPayload) {
  const [data] = useState<AppLogLevelResponse>(mockAppLogLevelResponse);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return { data, loading, error };
}

// ============================================================
// Lookups - Reference Number Type
// ============================================================

export interface ReferenceNumberTypePayload {
  _dc: number;
  type: 'referenceNumberType';
  page: number;
  start: number;
  limit: number;
}

export interface ReferenceNumberType {
  id: number;
  indicatorNumber: boolean;
  longDescription: string;
  shortDescription: string;
}

export interface ReferenceNumberTypeResponse {
  count: number;
  data: ReferenceNumberType[];
}

const mockReferenceNumberTypeResponse: ReferenceNumberTypeResponse = {
  count: 37,
  data: [
    {
      id: 5,
      indicatorNumber: true,
      longDescription: 'Test Indicator Number',
      shortDescription: 'Test Indicator',
    },
  ],
};

/**
 * Stubs GET /lookups.json?type=referenceNumberType
 * Returns available reference number type lookup values.
 */
export function useGetReferenceNumberTypes(payload?: ReferenceNumberTypePayload) {
  const [data] = useState<ReferenceNumberTypeResponse>(mockReferenceNumberTypeResponse);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return { data, loading, error };
}

// ============================================================
// Lookups - Receiving Discrepancy
// ============================================================

export interface ReceivingDiscrepancyPayload {
  _dc: number;
  type: 'receivingDiscrepancy';
  activeOnly: boolean;
  page: number;
  start: number;
  limit: number;
}

export interface ReceivingDiscrepancy {
  active: boolean;
  discrepancyType: string;
  id: number;
  longDescription: string;
  shortDescription: string;
}

export interface ReceivingDiscrepancyResponse {
  count: number;
  data: ReceivingDiscrepancy[];
}

const mockReceivingDiscrepancyResponse: ReceivingDiscrepancyResponse = {
  count: 64,
  data: [
    {
      active: false,
      discrepancyType: 'LIVE',
      id: 1,
      longDescription: 'Test',
      shortDescription: 'test',
    },
  ],
};

/**
 * Stubs GET /lookups.json?type=receivingDiscrepancy
 * Returns available receiving discrepancy lookup values.
 */
export function useGetReceivingDiscrepancies(payload?: ReceivingDiscrepancyPayload) {
  const [data] = useState<ReceivingDiscrepancyResponse>(mockReceivingDiscrepancyResponse);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return { data, loading, error };
}

// ============================================================
// Logs
// ============================================================

export interface LogsPayload {
  shippingOrderId: number;
  receivingId: number;
  routingId?: string;
  packingId?: string;
  cargoId?: string;
  taskingId?: string;
  missionId?: string;
  relatedEventId?: string;
  _dc: number;
  page: number;
  start: number;
  limit: number;
  sort: string;
  dir: 'ASC' | 'DESC';
}

export interface LogEntry {
  [key: string]: any; // TODO: verify type — response example showed empty array
}

export interface LogsResponse {
  format: string;
  count: number;
  data: LogEntry[];
}

const mockLogsResponse: LogsResponse = {
  format: 'json',
  count: 0,
  data: [],
};

/**
 * Stubs GET /logging/logs.json
 * Returns a paginated list of log entries for a given shipping order.
 */
export function useGetLogs(payload?: LogsPayload) {
  const [data] = useState<LogsResponse>(mockLogsResponse);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return { data, loading, error };
}

// ============================================================
// Receiving - Responsibility Off Codes
// ============================================================

export interface RespOffCodePayload {
  _dc: number;
  page: number;
  start: number;
  limit: number;
}

export interface RespOffCode {
  respoffcode: string;
  description: string;
}

export interface RespOffCodeResponse {
  data: RespOffCode[];
}

const mockRespOffCodeResponse: RespOffCodeResponse = {
  data: [
    {
      respoffcode: '99',
      description: 'TESTING UNIVERSITY',
    },
  ],
};

/**
 * Stubs GET /receiving/respoffcode
 * Returns a list of responsibility off codes.
 */
export function useGetRespOffCodes(payload?: RespOffCodePayload) {
  const [data] = useState<RespOffCodeResponse>(mockRespOffCodeResponse);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return { data, loading, error };
}

// ============================================================
// Receiving - Store Locations
// ============================================================

export interface StoreLocPayload {
  _dc: number;
  page: number;
  start: number;
  limit: number;
}

export interface StoreLoc {
  ms_location: string;
  locationsid: number;
  location: string;
}

export interface StoreLocResponse {
  data: StoreLoc[];
}

const mockStoreLocResponse: StoreLocResponse = {
  data: [
    {
      ms_location: 'TEST (BUILDING)',
      locationsid: 224856,
      location: '0999_0999_1',
    },
  ],
};

/**
 * Stubs GET /receiving/storeloc
 * Returns a list of store locations for receiving.
 */
export function useGetStoreLocs(payload?: StoreLocPayload) {
  const [data] = useState<StoreLocResponse>(mockStoreLocResponse);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return { data, loading, error };
}

// ============================================================
// Receiving - Condition Codes
// ============================================================

export interface ConditionsPayload {
  _dc: number;
  page: number;
  start: number;
  limit: number;
}

export interface Condition {
  value: string;
  description: string;
}

export interface ConditionsResponse {
  data: Condition[];
}

const mockConditionsResponse: ConditionsResponse = {
  data: [
    {
      value: 'A',
      description: 'TESTABLE SERVICE(TESTWITHOUTQUALIFICATION)',
    },
  ],
};

/**
 * Stubs GET /receiving/conditions
 * Returns a list of condition codes used in receiving line items.
 */
export function useGetConditions(payload?: ConditionsPayload) {
  const [data] = useState<ConditionsResponse>(mockConditionsResponse);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return { data, loading, error };
}

// ============================================================
// Receiving - Bins
// ============================================================

export interface BinsPayload {
  _dc: number;
  page: number;
  start: number;
  limit: number;
}

export interface Bin {
  binnum: string;
  location: string;
}

export interface BinsResponse {
  data: Bin[];
}

const mockBinsResponse: BinsResponse = {
  data: [
    {
      binnum: '.B13-2013240G013',
      location: '0303_0303_1',
    },
  ],
};

/**
 * Stubs GET /receiving/bins
 * Returns a list of bin numbers and their associated locations.
 */
export function useGetBins(payload?: BinsPayload) {
  const [data] = useState<BinsResponse>(mockBinsResponse);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return { data, loading, error };
}

// ============================================================
// WCS Conveyor Spurs
// ============================================================

export interface WcsConveyorSpursPayload {
  _dc: number;
  page: number;
  start: number;
  limit: number;
}

export interface ConveyorSortType {
  active: boolean;
  id: number;
  longDescription: string;
  shortDescription: string;
}

export interface ConveyorSpur {
  active: boolean;
  destination: number;
  id: number;
  internalRouteDisplay: string;
  internalRouteId: number;
  sort: ConveyorSortType;
  spur: ConveyorSortType;
}

export interface WcsConveyorSpursResponse {
  count: number;
  data: ConveyorSpur[];
}

const mockWcsConveyorSpursResponse: WcsConveyorSpursResponse = {
  count: 26,
  data: [
    {
      active: true,
      destination: 900001546,
      id: 15218,
      internalRouteDisplay: 'TEST DELIVERY',
      internalRouteId: 14,
      sort: {
        active: true,
        id: 1,
        longDescription: 'WCS28954789562-01',
        shortDescription: 'WCS28954789562-01',
      },
      spur: {
        active: true,
        id: 1,
        longDescription: 'C2-ST-01',
        shortDescription: 'C2-ST-01',
      },
    },
  ],
};

/**
 * Stubs GET /wcsconveyorspurs
 * Returns a list of WCS conveyor spur routing configurations.
 */
export function useGetWcsConveyorSpurs(payload?: WcsConveyorSpursPayload) {
  const [data] = useState<WcsConveyorSpursResponse>(mockWcsConveyorSpursResponse);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return { data, loading, error };
}

// ============================================================
// Receiving - Prefix Codes
// ============================================================

export interface PrefixCodesPayload {
  _dc: number;
  page: number;
  start: number;
  limit: number;
}

export interface PrefixCode {
  prefixcode: string;
  description: string;
}

export interface PrefixCodesResponse {
  data: PrefixCode[];
}

const mockPrefixCodesResponse: PrefixCodesResponse = {
  data: [
    {
      prefixcode: '999',
      description: 'TEST (999)',
    },
  ],
};

/**
 * Stubs GET /receiving/prefixcodes
 * Returns a list of prefix codes used in receiving.
 */
export function useGetPrefixCodes(payload?: PrefixCodesPayload) {
  const [data] = useState<PrefixCodesResponse>(mockPrefixCodesResponse);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return { data, loading, error };
}

// ============================================================
// App Files
// ============================================================

export interface AppFilesPayload {
  _dc: number;
  sonId: number;
  moduleId: number;
  moduleName: string;
  page: number;
  start: number;
  limit: number;
}

export interface AppFile {
  [key: string]: any; // TODO: verify type — no field details in example response
}

export interface AppFilesResponse {
  data: AppFile[];
  success: boolean;
  count: number;
}

const mockAppFilesResponse: AppFilesResponse = {
  data: [],
  success: true,
  count: 0,
};

/**
 * Stubs GET /appfiles/list
 * Returns a list of attached files for a given module record.
 */
export function useGetAppFiles(payload?: AppFilesPayload) {
  const [data] = useState<AppFilesResponse>(mockAppFilesResponse);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return { data, loading, error };
}

// ============================================================
// Rack Locations
// ============================================================

export interface RackLocationsPayload {
  _dc: number;
  page: number;
  start: number;
  limit: number;
}

export interface RackLocationType {
  active: boolean;
  id: number;
  longDescription: string;
  shortDescription: string;
}

export interface RackLocation {
  active: boolean;
  enterpriseLocationId: number;
  enterpriseLocationName: string;
  id: number;
  lastEditDate: number;
  lastEditUser: string;
  longDescription: string;
  rackLocationType: RackLocationType;
  shortDescription: string;
}

export interface RackLocationsResponse {
  data: RackLocation[];
}

const mockRackLocationsResponse: RackLocationsResponse = {
  data: [
    {
      active: true,
      enterpriseLocationId: 900009938,
      enterpriseLocationName: 'TEST - BUILDING B',
      id: 103,
      lastEditDate: 1484691551635,
      lastEditUser: 'Benjamin A. Button-Test-',
      longDescription: 'A-20',
      rackLocationType: {
        active: true,
        id: 9,
        longDescription: 'Pickup',
        shortDescription: 'Pickup',
      },
      shortDescription: 'A-20',
    },
  ],
};

/**
 * Stubs GET /racklocations
 * Returns a list of rack locations available for receiving.
 */
export function useGetRackLocations(payload?: RackLocationsPayload) {
  const [data] = useState<RackLocationsResponse>(mockRackLocationsResponse);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return { data, loading, error };
}

// ============================================================
// Common - Officers
// ============================================================

export interface OfficersPayload {
  _dc: number;
  page: number;
  start: number;
  limit: number;
}

export interface OfficerTeam {
  id: number;
  longDescription: string;
  shortDescription: string;
}

export interface Officer {
  active: boolean;
  createdLocation: Record<string, any>;
  enterpriseLocationId: number;
  id: number;
  name: string;
  officerTeam: OfficerTeam;
  officerTeamId: number;
}

export interface OfficersResponse {
  count: number;
  data: Officer[];
}

const mockOfficersResponse: OfficersResponse = {
  count: 293,
  data: [
    {
      active: true,
      createdLocation: {},
      enterpriseLocationId: 900009938,
      id: 20,
      name: 'Adam W. Test-Test-',
      officerTeam: {
        id: 8,
        longDescription: 'Testtic',
        shortDescription: 'TESTTIC',
      },
      officerTeamId: 8,
    },
  ],
};

/**
 * Stubs GET /common/officers
 * Returns a paginated list of officers.
 */
export function useGetOfficers(payload?: OfficersPayload) {
  const [data] = useState<OfficersResponse>(mockOfficersResponse);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return { data, loading, error };
}

// ============================================================
// Mail Locations (preserved from original file)
// ============================================================

const MOCK_MAILLOCATIONS = [
  {
    id: 1,
    active: true,
    locationName: 'Main Building',
    location: {
      buildingId: 1,
      address: null,
      locationType: { id: 1 },
      name: 'Main Building',
    },
  },
  {
    id: 2,
    active: true,
    locationName: '123 Main St, Springfield IL 62701',
    location: {
      buildingId: null,
      address: '123 Main St, Springfield IL 62701',
      locationType: { id: 3 },
      name: '123 Main St, Springfield IL 62701',
    },
  },
  {
    id: 3,
    active: false,
    locationName: 'Annex A',
    location: {
      buildingId: 2,
      address: null,
      locationType: { id: 1 },
      name: 'Annex A',
    },
  },
];

/**
 * Stubs mail location data (manually authored, no API equivalent in PDF).
 */
export function useFetchMaillocations() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(MOCK_MAILLOCATIONS);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return { data, loading };
}
