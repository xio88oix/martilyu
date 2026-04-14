"use client";

import { Badge, Box, Tab, Tabs } from "@mui/material";
import { ReactNode, useEffect, useRef, useState } from "react";
import ShippingInformation from "./ShippingInformation";
import NewReceivingForm, {
  type ReceivingBusinessState,
} from "./NewReceivingForm";
import PreviousReceiptsController from "./PreviousReceiptsController";
import DraftReceiptsController from "./DraftReceiptsController";
import BoxAttributesGridController from "./BoxAttributesGridController";
import LineItemsGridController from "./LineItemsGridController";
import ReferenceTrackingGridController from "./ReferenceTrackingGridController";
import { WarningAlert } from "@/components/CustomComponents";

// ---------------------------------------------------------------------------
// ReceivingData shape
// ---------------------------------------------------------------------------

export interface ReceivingData {
  previousReceipts?: unknown[];
  draftReceipts?: unknown[];
  boxAttributes?: unknown[];
  lineItems?: unknown[];
  genesispoid?: string | null;
  tireq?: string;
  refrigerationreq?: string;
  freezingreq?: string;
  containshazmat?: string;
  markpackship?: string;
  secureshipmentreq?: string;
  [key: string]: unknown;
}

// ---------------------------------------------------------------------------
// TabPanel helper
// ---------------------------------------------------------------------------

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
  flex?: boolean;
}

function ReceivingPanel(props: TabPanelProps) {
  const { children, value, index, flex, ...other } = props;
  const active = index === value;
  const hasBeenActive = useRef(active);
  if (active) hasBeenActive.current = true;

  if (!hasBeenActive.current) return null;

  return (
    <div
      role="tabpanel"
      hidden={!active}
      id={"receiving-tab-panel-" + index}
      className={flex ? "panel__flex" : "panel"}
      style={!active ? { display: "none" } : undefined}
      {...other}
    >
      {children}
    </div>
  );
}

function allyProps(index: number) {
  return {
    id: "receiving-tab-" + index,
  };
}

// ---------------------------------------------------------------------------
// ReceivingTabPanel — main export
// ---------------------------------------------------------------------------

interface ReceivingTabPanelProps {
  data: ReceivingData | null;
  type: string | null;
  receivingBusinessState: ReceivingBusinessState;
  onFormValidityChange?: (valid: boolean) => void;
  onDataChange?: (changes: Partial<Record<string, unknown>>) => void;
}

export default function ReceivingTabPanel(props: ReceivingTabPanelProps) {
  const [value, setValue] = useState(1);
  const hideHistoryPanels = props.receivingBusinessState.isPreviousReceiving;
  const [prevRecieptsWarningOpen, setPrevRecieptsWarningOpen] = useState(false);
  const handlePrevRecieptWarningClose = () => {
    setPrevRecieptsWarningOpen(false);
  };

  const [specialHandlingWarningOpen, setSpecialHandlingWarningOpen] =
    useState(false);
  const handleSpecialHandlingWarningClose = () => {
    setSpecialHandlingWarningOpen(false);
  };

  const [shipMessage, setShipMessage] = useState<string | null>(null);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (hideHistoryPanels && value > 4) {
      setValue(4);
    }
  }, [hideHistoryPanels, value]);

  useEffect(() => {
    let markPackShipMsg = "";
    const openPrevWarning =
      (props.data?.previousReceipts?.length ?? 0) > 0 &&
      props.data?.genesispoid == null;
    if (openPrevWarning) {
      setPrevRecieptsWarningOpen(true);
    }
    if (props.data?.tireq === "WEA") {
      // markPackShipCls = 'x-form-markpackship-red';
      markPackShipMsg = "Contains Weapons/Ammunition.";
      //} else if (!Ext.isEmpty(me.rec.data.markpackship) && ((me.rec.data.markpackship.indexOf('Refrigerated=Yes') >= 0)||(me.rec.data.markpackship.indexOf('Freeze=Yes') >= 0))) {
    } else if (
      props.data?.refrigerationreq === "YES" ||
      props.data?.freezingreq === "YES"
    ) {
      // markPackShipCls = 'x-form-markpackship-blue';
      markPackShipMsg = "Refrigeration or Freezing Required.";
      //} else if (!Ext.isEmpty(props.data?.markpackship) && ((props.data?.markpackship.indexOf('Hazmat=Yes') >= 0))) {
    } else if (props.data?.containshazmat === "YES") {
      // markPackShipCls = 'x-form-markpackship-yellow';
      markPackShipMsg = "Contains Hazmat Material.";
      //} else if (!Ext.isEmpty(props.data?.markpackship) && ((props.data?.markpackship.indexOf('Special Handling=Yes') >= 0)||(props.data?.markpackship.indexOf('Secure Transport=Yes') >= 0))) {
    } else if (
      props.data?.markpackship === "" ||
      props.data?.secureshipmentreq === "YES"
    ) {
      // markPackShipCls = 'x-form-markpackship-green';
      markPackShipMsg = "Special Handling or Secure Transport Required.";
    }
    setShipMessage(markPackShipMsg);
  }, [props.data]);

  useEffect(() => {
    if (shipMessage && shipMessage !== "") {
      setSpecialHandlingWarningOpen(true);
    }
  }, [shipMessage]);

  return (
    <Box
      sx={{
        // Uncomment the below two lines for vertical tab panel
        display: "flex",
        flexGrow: "1",
        // Comment Width for vertical tab panel
        // width: "100%",
      }}
    >
      <WarningAlert
        open={prevRecieptsWarningOpen}
        onClose={handlePrevRecieptWarningClose}
        title="Existing Previous Receipts"
        message="This SON has submitted receivings"
      />
      <WarningAlert
        open={specialHandlingWarningOpen}
        onClose={handleSpecialHandlingWarningClose}
        title="Special Handling"
        message={shipMessage ?? ""}
      />
      <Tabs
        // Uncomment below two lines for vertical tab panel
        orientation="vertical"
        variant="scrollable"
        value={value}
        onChange={handleChange}
        sx={{
          backgroundColor: "#E0F2F2",
          "& .MuiButtonBase-root": {
            fontWeight: "700 !important",
            color: "#23404F !important",
          },
        }}
      >
        <Tab label="Shipping Information" {...allyProps(0)} />
        <Tab label="Receiving" {...allyProps(1)} />
        <Tab label="Line Items" {...allyProps(2)} />
        <Tab label="Reference/Tracking Numbers" {...allyProps(3)} />
        <Tab
          label={
            <Badge
              badgeContent={props.data?.boxAttributes?.length ?? 0}
              color="default"
              showZero={false}
            >
              Box Attributes
            </Badge>
          }
          {...allyProps(4)}
        />
        {!hideHistoryPanels && (
          <Tab
            label={
              <Badge
                badgeContent={props.data?.previousReceipts?.length ?? 0}
                color="default"
                showZero={false}
              >
                Previous Receipts
              </Badge>
            }
            {...allyProps(5)}
          />
        )}
        {!hideHistoryPanels && (
          <Tab
            label={
              <Badge
                badgeContent={props.data?.draftReceipts?.length ?? 0}
                color="default"
                showZero={false}
              >
                Draft Receipts
              </Badge>
            }
            {...allyProps(6)}
          />
        )}
      </Tabs>
      <ReceivingPanel value={value} index={0} flex={true}>
        <ShippingInformation data={props.data} type={props.type} />
        {/* <PackagesPanel /> */}
      </ReceivingPanel>
      <ReceivingPanel value={value} index={1} flex={true}>
        <NewReceivingForm
          data={(props.data ?? {}) as Record<string, unknown>}
          type={props.type ?? undefined}
          receivingBusinessState={props.receivingBusinessState}
          onFormValidityChange={props.onFormValidityChange}
          onDataChange={props.onDataChange}
        />
      </ReceivingPanel>
      <ReceivingPanel value={value} index={2}>
        <LineItemsGridController data={(props.data?.lineItems ?? []) as any} active={value === 2} />
      </ReceivingPanel>
      <ReceivingPanel value={value} index={3}>
        <ReferenceTrackingGridController
          data={(props.data?.trackingNumbers as unknown[]) ?? []}
          active={value === 3}
        />
      </ReceivingPanel>
      <ReceivingPanel value={value} index={4}>
        <BoxAttributesGridController data={props.data?.boxAttributes ?? []} active={value === 4} />
      </ReceivingPanel>
      {!hideHistoryPanels && (
        <>
          <ReceivingPanel value={value} index={5}>
            <PreviousReceiptsController
              data={props.data?.previousReceipts ?? []}
              type={props.type}
              active={value === 5}
            />
          </ReceivingPanel>
          <ReceivingPanel value={value} index={6}>
            <DraftReceiptsController
              data={props.data?.draftReceipts ?? []}
              type={props.type}
              active={value === 6}
            />
          </ReceivingPanel>
        </>
      )}
    </Box>
  );
}
