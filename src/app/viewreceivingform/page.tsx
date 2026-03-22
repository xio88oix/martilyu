import { Box } from "@mui/material";
import ReceiveCategorGrid from "./ReceiveCategoryGrid";

export default function ReceivingPage() {
  const contractReceivingDetails =
    "Receive a BASIS using contract number." +
    "\n BASIS receivngusers must be COTRcertified" +
    "In If you are COTR certified and still cannot receive BASIS items, click here.";

  const purchaseOrderReceivingDetails =
    "Genesis procurement receiving using either Purchase Order or Indicator Number.";
  return (
    <>
      <Box sx={{ display: "flex", flexFlow: "column" }}>
        <Box className="simpleGrid__headerBox">
          <h1>Receiving</h1>
        </Box>
        <ReceiveCategorGrid />
      </Box>
    </>
  );
}
