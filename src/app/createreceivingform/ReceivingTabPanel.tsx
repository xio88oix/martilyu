"use client";

import { Box, Tab, Tabs } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import ShippingInformation from "./ShippingInformation";
import NewReceivingForm from "./NewReceivingForm";
import PreviousReceiptsController from "./PreviousReceiptsController";
import DraftReceiptsController from "./DraftReceiptsController";
import BoxAttributesGridController from "./BoxAttributesGridController";
import LineItemsGridController from "./LineItemsGridController";
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
  const { children, value, index, ...other } = props;
  return index === value ? (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={"receiving-tab-panel-" + index}
      className={props.flex ? "panel__flex" : "panel"}
      // style={{
      //   margin: "1rem 0rem",
      //   width: "100%",
      //   display: "flex",
      //   maxHeight: "45vh",
      //   overflow: "auto",
      // }}
      {...other}
    >
      {children}
    </div>
  ) : (
    ""
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
}

export default function ReceivingTabPanel(props: ReceivingTabPanelProps) {
  const [value, setValue] = useState(0);
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
        <Tab label="New Receiving" {...allyProps(1)} />
        <Tab label="Previous Receipts" {...allyProps(2)} />
        <Tab label="Draft Receipts" {...allyProps(3)} />
        <Tab label="Box Attributes" {...allyProps(4)} />
        <Tab label="Line Items" {...allyProps(5)} />
      </Tabs>
      <ReceivingPanel value={value} index={0} flex={true}>
        <ShippingInformation data={props.data} type={props.type} />
        {/* <PackagesPanel /> */}
      </ReceivingPanel>
      <ReceivingPanel value={value} index={1} flex={true}>
        <NewReceivingForm
          data={(props.data ?? {}) as Record<string, unknown>}
          type={props.type ?? undefined}
        />
      </ReceivingPanel>
      <ReceivingPanel value={value} index={2}>
        <PreviousReceiptsController data={props.data?.previousReceipts ?? []} />
      </ReceivingPanel>
      <ReceivingPanel value={value} index={3}>
        <DraftReceiptsController data={props.data?.draftReceipts ?? []} />
      </ReceivingPanel>
      <ReceivingPanel value={value} index={4}>
        <BoxAttributesGridController data={props.data?.boxAttributes ?? []} />
      </ReceivingPanel>
      <ReceivingPanel value={value} index={5}>
        <LineItemsGridController data={(props.data?.lineItems ?? []) as any} />
      </ReceivingPanel>
    </Box>
  );
}
