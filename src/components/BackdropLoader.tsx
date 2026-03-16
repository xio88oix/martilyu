"use client";

import { Backdrop, CircularProgress } from "@mui/material";

export default function BackdropLoader({ open }: { open: boolean }) {
  return (
    <Backdrop
      open={open}
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, color: "#fff" }}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}
