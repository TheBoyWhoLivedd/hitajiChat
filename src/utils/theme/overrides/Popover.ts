// ----------------------------------------------------------------------

import { Theme } from "@mui/material";
export interface PopoverCustomTheme extends Theme {
  customShadows: {
    dropdown: string;
    // add more custom shadow values if needed
  };
}


export default function Popover(theme:PopoverCustomTheme) {
  return {
    MuiPopover: {
      styleOverrides: {
        paper: {
          boxShadow: theme.customShadows.dropdown,
          borderRadius: Number(theme.shape.borderRadius) * 1.5,
        },
      },
    },
  };
}
