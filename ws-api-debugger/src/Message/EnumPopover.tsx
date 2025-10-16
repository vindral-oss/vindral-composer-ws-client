import React, { useState } from "react";
import Popover from "@mui/material/Popover";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

interface EnumPopoverProps {
  href: string;
  typeName: string;
}

export function EnumPopover({ href, typeName }: EnumPopoverProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };
  const handleClose = () => {
    setAnchorEl(null);
    setOpen(false);
  };
  return (
    <>
      <span
        className="ml-2 text-xs text-orange-600 underline hover:text-orange-800 cursor-pointer"
        onClick={handleClick}
      >
        {typeName}
      </span>
      <Popover
        open={open}
        anchorEl={anchorEl}
        // Only close with X button
        onClose={() => {}}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          style: { width: 500, height: 400, overflow: "hidden" },
        }}
        hideBackdrop
        disableEnforceFocus
        disableAutoFocus
      >
        <Box sx={{ position: "relative", height: "100%", width: "100%" }}>
          <IconButton
            onClick={handleClose}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              zIndex: 2,
              backgroundColor: "#ff9800",
              color: "#fff",
              fontSize: 20,
              "&:hover": { backgroundColor: "#fb8c00" },
            }}
            size="medium"
            aria-label="Close"
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
          <iframe
            src={href}
            title="Enum Documentation"
            style={{ width: "100%", height: "100%", border: "none" }}
            sandbox=""
          />
        </Box>
      </Popover>
    </>
  );
}
