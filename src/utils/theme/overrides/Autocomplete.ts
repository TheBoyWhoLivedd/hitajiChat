// ----------------------------------------------------------------------
import { Theme } from '@mui/material/styles';

export interface AutocompleteCustomTheme extends Theme {
  customShadows: {
    dropdown: string;
    // add more custom shadow values if needed
  };
}


export default function Autocomplete(theme:AutocompleteCustomTheme) {
  return {
    MuiAutocomplete: {
      styleOverrides: {
        paper: {
          boxShadow: theme.customShadows.dropdown,
        },
        listbox: {
          padding: theme.spacing(0, 1),
          '& .MuiAutocomplete-option': {
            padding: theme.spacing(1),
            margin: theme.spacing(1, 0),
            borderRadius: theme.shape.borderRadius,
          },
        },
      },
    },
  };
}
