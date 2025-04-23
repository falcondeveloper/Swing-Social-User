"use client";

import { Close } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import {
  SnackbarProvider,
  SnackbarProviderProps,
  closeSnackbar,
} from "notistack";

export { closeSnackbar, enqueueSnackbar, useSnackbar } from "notistack";

export default function Popup(props: SnackbarProviderProps) {
  return (
    <SnackbarProvider
      autoHideDuration={3000}
      maxSnack={3}
      action={(id) => (
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={() => closeSnackbar(id)}
        >
          <Close fontSize="small" />
        </IconButton>
      )}
      {...props}
    />
  );
}