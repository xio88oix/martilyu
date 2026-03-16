"use client";

import { Alert, Snackbar, SnackbarCloseReason } from "@mui/material";

type MySnackbarProps = {
  open: boolean;
  onClose: (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => void;
  autoHideDuration?: number;
  message: string;
  severity: "success" | "error" | "warning" | "info";
};

export default function MySnackbar({
  open,
  onClose,
  autoHideDuration = 6000,
  message,
  severity,
}: MySnackbarProps) {
  return (
    <Snackbar open={open} autoHideDuration={autoHideDuration} onClose={onClose}>
      <Alert
        onClose={(e) => onClose(e)}
        severity={severity}
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
