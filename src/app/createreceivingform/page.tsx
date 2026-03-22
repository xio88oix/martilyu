"use client";

import { Box, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ReceivingTabPanel from "./ReceivingTabPanel";

// NOTE: CustomToolbar will be provided by CustomComponents once converted from its PDF.
// NOTE: useFetchReceivingData and useFetchReceivingForm are service hooks to be added to ServiceHooks/services.tsx.

// ---------------------------------------------------------------------------
// Temporary inline stubs — replace with real imports once companion files exist
// ---------------------------------------------------------------------------

interface ToolbarButton {
  name: string;
  handleClick: () => void;
}

interface CustomToolbarProps {
  readOnlyData: unknown[];
  buttons: ToolbarButton[];
  smallButtons?: boolean;
}

function CustomToolbar({ buttons }: CustomToolbarProps) {
  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", p: 1 }}>
      {buttons.map((btn) => (
        <button key={btn.name} onClick={btn.handleClick} type="button">
          {btn.name}
        </button>
      ))}
    </Box>
  );
}

interface ReceivingFormData {
  shippingOrderId?: string;
  poNumber?: string;
  son?: string;
  receivedDate?: string;
  packageId?: string;
  [key: string]: unknown;
}

interface FetchDataResult {
  data: ReceivingFormData[] | null;
  loading: boolean;
}

function useFetchReceivingData(
  id: string | null,
  type: string | null,
  numberType: string | null
): FetchDataResult {
  // TODO: replace stub with real API call via Axios
  const [data, setData] = useState<ReceivingFormData[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      // TODO: remove mock — replace with real API response
      setData([
        {
          shippingOrderId: "RECV-00001",
          son: id ?? "SON-UNKNOWN",
          poNumber: "PO-00001",
          receivedDate: "2026-03-22",
          packageId: "PKG-00001",
          destination: "HQ Warehouse",
          type: type ?? "",
          numberType: numberType ?? "0",
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

function useFetchReceivingForm(
  recId: string,
  recDate: string,
  son: string,
  ponum: string,
  packageId: string
): FetchFormResult {
  // TODO: replace stub with real API call via Axios
  const [formData, setFormData] = useState<{ data: ReceivingFormData | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!recId) return;
    const timer = setTimeout(() => {
      // TODO: remove mock — replace with real API response
      setFormData({
        data: {
          shippingOrderId: recId,
          son,
          poNumber: ponum,
          receivedDate: recDate,
          packageId,
          destination: "HQ Warehouse",
          carrier: "Mock Carrier",
          receivingGroup: "NPR Group",
          status_id: 1,
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

  const [recId, setRecId] = useState("");
  const [son, setSon] = useState(id);
  const [ponum, setPonum] = useState("");
  const [recDate, setRecDate] = useState("");
  const [packageId, setPackageId] = useState("");

  const {
    formData,
    loading: recFormLoading,
  } = useFetchReceivingForm(recId, recDate, son, ponum, packageId);

  const [recFormData, setRecFormData] = useState<ReceivingFormData | null>(null);

  useEffect(() => {
    if (!loading) {
      if (data && data.length > 0) {
        const d = data[0];
        if (d.shippingOrderId) {
          setRecId(d.shippingOrderId);
        }
        if (d.poNumber) {
          setPonum(d.poNumber);
        }
        if (d.son) {
          setSon(d.son);
        }
        if (d.receivedDate) {
          setRecDate(d.receivedDate);
        }
        if (d.packageId) {
          setPackageId(d.packageId);
        }
      }
    }
    if (!recFormLoading) {
      setRecFormData(formData?.data ?? null);
    }
  }, [loading, recFormLoading]);

  const buttons: ToolbarButton[] = [
    { name: "Submit", handleClick: () => {} },
    { name: "Ordered Items", handleClick: () => {} },
    { name: "Hand Receipt", handleClick: () => {} },
    { name: "Open Genesis Purchase Order", handleClick: () => {} },
    { name: "Print", handleClick: () => {} },
    { name: "Delivered To Customer", handleClick: () => {} },
    { name: "Save As Draft", handleClick: () => {} },
    { name: "View Audit Log", handleClick: () => {} },
    { name: "Cancel Record", handleClick: () => {} },
  ];

  return !recFormLoading ? (
    <Box className="pageTitle form__section">
      <Box className="pageTitle__headerBox">
        <h1>{`New Receiving- ${son}`}</h1>
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
        <ReceivingTabPanel data={recFormData} type={type} />
      </Box>
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
