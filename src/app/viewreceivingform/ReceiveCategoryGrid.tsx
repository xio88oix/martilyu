"use client";
import {
  Box,
  FormGroup,
  IconButton,
  Input,
  InputAdornment,
  Card,
  CardContent,
  MenuItem,
  Select,
  SelectChangeEvent,
  SnackbarCloseReason,
  Stack,
  Typography,
} from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2";
import { Search } from "@mui/icons-material";
import { useEffect, useState } from "react";
import MySnackbar from "@/components/MySnackbar";
import ReceiveCategoryCard from "./ReceiveCategoryCard";
import SearchResultGridController from "./SearchResultGridController";

// TODO: Replace stub with real useFetchBaseUrl once added to ../ServiceHooks/services
function useFetchBaseUrl(): { baseUrl: string; baseUrlLoading: boolean } {
  return { baseUrl: "", baseUrlLoading: false };
}

// NOTE: ESP_PAGE and BASIS_PAGE links from the PDF are referenced in warning/detail strings.
// ESP_PAGE url: https://esp.cia/sp
// BASIS_PAGE url: https://askfinance.cia/af?id=finance_kb_article&sys_id=52f3225d1d9a3f801f0b164945f3fb4b

export default function ReceiveCategoryGrid() {
  const { baseUrl, baseUrlLoading } = useFetchBaseUrl();

  const contractReceivingDetails =
    "Receive a BASIS using contract number. BASIS receivng users must be COTR" +
    " certified. If you are COTR certified and still cannot receive BASIS items," +
    "click ";

  const purchaseOrderReceivingDetails =
    "Genesis procurement receiving using either Purchase Order or Indicator Number.";

  const dvvReceivingDetails = "DVV/LOC-E use only.";

  const nprDetails =
    "Special case receiving generally reserved for WMA Pouch Services Branch(PSB).";

  const iarDetails =
    "(Incoming Cargo Queue) For Logistics and Support Officers responsible for managing the deliver of cargo through their stations.";

  const packageAckDetails =
    "For end customers to acknowledge that they have physically received a package.";

  const [selected, setSelected] = useState<string>("");
  const [type, setType] = useState<string | null>(null);
  const [numberType, setNumberType] = useState<number>(0);
  const [filter, setFilter] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [rowsData, setRowsData] = useState<unknown[]>([]);

  // Snack Bar
  const [snackBarOpen, setSnackBarOpen] = useState<boolean>(false);
  const [snackBarMessage, setSnackBarMessage] = useState<string>("");
  const [snackBarSeverity, setSnackBarSeverity] = useState<
    "success" | "error" | "warning" | "info"
  >("info");

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === "clickaway") {
      setSnackBarOpen(false);
      return;
    }
    setSnackBarOpen(false);
  };

  const handleSearch = async () => {
    setSearchLoading(true);
    if (!type || type === "") {
      setSnackBarOpen(true);
      setSnackBarSeverity("error");
      setSnackBarMessage("Please Select a Receiving Type");
      return;
    } else if (numberType === null) {
      setSnackBarOpen(true);
      setSnackBarSeverity("error");
      setSnackBarMessage("Please Select a Search By Category");
      return;
    } else if (filter === null || filter?.trim() === "") {
      setSnackBarOpen(true);
      setSnackBarSeverity("error");
      setSnackBarMessage("Enter a number to search");
    } else {
      if (type === "iar") {
        window.open(`/next/viewincomingcargo`);
      } else if (type === "pa") {
        window.open(`/next/packageacknowledgement?son=${filter}`);
      } else if (type === "b5" && numberType === 0) {
        // TODO: remove mock — replace with real API call once backend is available
        const mockRows = [
          {
            id: 1,
            son: filter,
            po: "PO-00001",
            ind: "REF-NPR-001",
            statusid: 2,
          },
        ];
        setRowsData(mockRows);
        setSearchLoading(false);
      } else {
        await fetch(
          `${baseUrl}/receiving/movements?type=${type}&numberType=${numberType}&filter=${filter}`,
        ).then((res) => {
          if (res.status !== 200) {
            setSnackBarOpen(true);
            setSnackBarSeverity("error");
            setSnackBarMessage("There were no results for your search");
            setSearchLoading(false);
            setRowsData([]);
          } else {
            res.json().then((data) => {
              if (data.com) {
                setSnackBarOpen(true);
                setSnackBarSeverity("warning");
                setSnackBarMessage(
                  "The SON you are trying to receive is in Completed status. If you are receving this message in error, please submit a request to ESP.cia to report an issue.",
                );
                setSearchLoading(false);
                setRowsData([]);
              } else {
                setRowsData(data.data);
                setSearchLoading(false);
              }
            });
          }
        });
      }
    }
  };

  useEffect(() => {
    console.log("The value of search rows is ", rowsData);
  }, [rowsData]);

  useEffect(() => {
    if (selected === "Contract Receiving") {
      setType("b1");
      setRowsData([]);
    } else if (selected === "Purchase Order Receiving") {
      setType("b2");
      setRowsData([]);
    } else if (selected === "Data Voice Video Receiving") {
      setType("b3");
      setRowsData([]);
    } else if (selected === "Non-Procurement / Ascent Receiving") {
      setType("b5");
      setRowsData([]);
    } else if (selected === "Internal Agency Receiving") {
      setType("iar");
      setRowsData([]);
    } else if (selected === "Package Acknowledgement") {
      setType("pa");
      setRowsData([]);
    } else {
      setType(null);
      setRowsData([]);
    }
  }, [selected]);

  return !baseUrlLoading ? (
    <>
      <Box sx={{ padding: "1rem" }}>
        <MySnackbar
          open={snackBarOpen}
          onClose={handleSnackbarClose}
          autoHideDuration={8000}
          message={snackBarMessage}
          severity={snackBarSeverity}
        />
        <div className="form-section">
          <Grid2 columnGap={1} columnSpacing={2} rowSpacing={1} container>
            <Stack flexGrow={1}>
              <Grid2>
                <ReceiveCategoryCard
                  title="Contract Receiving"
                  imagePath="beach.png"
                  details={contractReceivingDetails}
                  setSelected={setSelected}
                  selected={selected === "Contract Receiving" ? true : false}
                />
              </Grid2>
              <Grid2>
                <ReceiveCategoryCard
                  title="Data Voice Video Receiving"
                  imagePath="cat.png"
                  details={dvvReceivingDetails}
                  setSelected={setSelected}
                  selected={
                    selected === "Data Voice Video Receiving" ? true : false
                  }
                />
              </Grid2>
              <Grid2>
                <ReceiveCategoryCard
                  title="Internal Agency Receiving"
                  imagePath="flower.png"
                  details={iarDetails}
                  setSelected={setSelected}
                  selected={
                    selected === "Internal Agency Receiving" ? true : false
                  }
                />
              </Grid2>
            </Stack>
            <Stack flexGrow={1}>
              <Grid2>
                <ReceiveCategoryCard
                  title="Purchase Order Receiving"
                  imagePath="rocket.png"
                  details={purchaseOrderReceivingDetails}
                  setSelected={setSelected}
                  selected={
                    selected === "Purchase Order Receiving" ? true : false
                  }
                />
              </Grid2>
              <Grid2>
                <ReceiveCategoryCard
                  title="Non-Procurement / Ascent Receiving"
                  imagePath="cookie.png"
                  details={nprDetails}
                  setSelected={setSelected}
                  selected={
                    selected === "Non-Procurement / Ascent Receiving"
                      ? true
                      : false
                  }
                />
              </Grid2>
              <Grid2>
                <ReceiveCategoryCard
                  title="Package Acknowledgement"
                  imagePath="car.png"
                  details={packageAckDetails}
                  setSelected={setSelected}
                  selected={
                    selected === "Package Acknowledgement" ? true : false
                  }
                />
              </Grid2>
            </Stack>
            <Stack flexGrow={1}>
              <Grid2>
                <Card sx={{ margin: "2rem 0", display: "flex" }}>
                  <CardContent
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "column",
                      alignItems: "center",
                      flexGrow: 1,
                    }}
                  >
                    <Typography margin={"3rem 0"} variant="h3">
                      Search By
                    </Typography>
                    <div
                      className="section-welcome__search-container"
                      style={{ margin: "2rem 0" }}
                    >
                      <FormGroup sx={{ flexFlow: "row", flexGrow: 1 }}>
                        <Select
                          className="body1 section-welcome__search-select"
                          value={numberType}
                          inputProps={{
                            style: {
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            },
                          }}
                          onChange={(e: SelectChangeEvent<number>) => {
                            setNumberType(e.target?.value as number);
                          }}
                        >
                          <MenuItem
                            sx={{ "&:hover": { backgroundColor: "#B1DFDC" } }}
                            value={0}
                          >
                            SON
                          </MenuItem>
                          <MenuItem
                            sx={{ "&:hover": { backgroundColor: "#B1DFDC" } }}
                            value={1}
                          >
                            Indicator Number
                          </MenuItem>
                          <MenuItem
                            sx={{ "&:hover": { backgroundColor: "#B1DFDC" } }}
                            value={2}
                          >
                            Contract Number
                          </MenuItem>
                          <MenuItem
                            sx={{ "&:hover": { backgroundColor: "#B1DFDC" } }}
                            value={3}
                          >
                            Genesis PO Number
                          </MenuItem>
                          <MenuItem
                            sx={{ "&:hover": { backgroundColor: "#B1DFDC" } }}
                            value={4}
                          >
                            Vendor PO Number
                          </MenuItem>
                          <MenuItem
                            sx={{ "&:hover": { backgroundColor: "#B1DFDC" } }}
                            value={5}
                          >
                            Ascent REQ Number
                          </MenuItem>
                        </Select>
                        <Input
                          className="body1 section-welcome__search-field"
                          disableUnderline={true}
                          placeholder="Enter Number"
                          fullWidth={true}
                          value={filter ?? ""}
                          onChange={(
                            e: React.ChangeEvent<HTMLInputElement>,
                          ) => {
                            setFilter(e.target?.value);
                          }}
                          inputProps={{
                            style: {
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            },
                          }}
                          endAdornment={
                            <InputAdornment position="end">
                              <IconButton onClick={handleSearch}>
                                <Search className="section-welcome__search-icon-button" />
                              </IconButton>
                            </InputAdornment>
                          }
                        />
                      </FormGroup>
                    </div>
                  </CardContent>
                </Card>
              </Grid2>
              {rowsData.length > 0 ? (
                <Grid2>
                  <SearchResultGridController
                    rows={rowsData}
                    searchLoading={searchLoading}
                    isCr={type === "b1" ? true : false}
                    type={type}
                    numberType={numberType}
                  />
                </Grid2>
              ) : (
                <></>
              )}
            </Stack>
          </Grid2>
        </div>
      </Box>
    </>
  ) : (
    <></>
  );
}
