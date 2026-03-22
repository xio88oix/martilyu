"use client";

import {
  AppBar,
  Button,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NavBar() {
  const router = useRouter();
  const [referenceAnchor, setReferenceAnchor] =
    useState<HTMLElement | null>(null);
  const [receivingAnchor, setReceivingAnchor] =
    useState<HTMLElement | null>(null);

  const handleNavigate = (href: string) => {
    setReferenceAnchor(null);
    setReceivingAnchor(null);
    router.push(href);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ mr: 3 }}>
          App
        </Typography>

        {/* Reference menu */}
        <Button
          color="inherit"
          onClick={(e) => setReferenceAnchor(e.currentTarget)}
        >
          Reference
        </Button>
        <Menu
          anchorEl={referenceAnchor}
          open={Boolean(referenceAnchor)}
          onClose={() => setReferenceAnchor(null)}
        >
          <MenuItem onClick={() => handleNavigate("/viewmaillocations")}>
            Mail Locations
          </MenuItem>
        </Menu>

        {/* Receiving menu */}
        <Button
          color="inherit"
          onClick={(e) => setReceivingAnchor(e.currentTarget)}
        >
          Receiving
        </Button>
        <Menu
          anchorEl={receivingAnchor}
          open={Boolean(receivingAnchor)}
          onClose={() => setReceivingAnchor(null)}
        >
          <MenuItem onClick={() => handleNavigate("/viewreceivingform")}>
            Receiving
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
