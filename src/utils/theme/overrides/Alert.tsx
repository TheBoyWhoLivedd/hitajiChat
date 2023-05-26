import { Theme } from '@mui/material';
import { ErrorIcon, InfoIcon, SuccessIcon, WarningIcon } from './CustomIcons';
// ----------------------------------------------------------------------
type PaletteColor = 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
export default function Alert(theme:Theme) {
  const isLight = theme.palette.mode === 'light';

  const standardStyle = (color:PaletteColor) => ({
    color: theme.palette[color][isLight ? 'dark' : 'light'],
    backgroundColor: theme.palette[color][isLight ? 'light' : 'dark'],
    '& .MuiAlert-icon': {
      color: theme.palette[color][isLight ? 'main' : 'light'],
    },
  });

  const filledStyle = (color:PaletteColor) => ({
    color: theme.palette[color].contrastText,
  });

  const outlinedStyle = (color:PaletteColor) => ({
    color: theme.palette[color][isLight ? 'dark' : 'light'],
    border: `solid 1px ${theme.palette[color][isLight ? 'light' : 'dark']}`,
    backgroundColor: theme.palette[color][isLight ? 'light' : 'dark'],
    '& .MuiAlert-icon': {
      color: theme.palette[color][isLight ? 'main' : 'light'],
    },
  });

  return {
    MuiAlert: {
      defaultProps: {
        iconMapping: {
          info: <InfoIcon />,
          success: <SuccessIcon />,
          warning: <WarningIcon />,
          error: <ErrorIcon />,
        },
      },

      styleOverrides: {
        message: {
          '& .MuiAlertTitle-root': {
            marginBottom: theme.spacing(0.5),
          },
        },
        action: {
          '& button:not(:first-of-type)': {
            marginLeft: theme.spacing(1),
          },
        },

        standardInfo: standardStyle('info'),
        standardSuccess: standardStyle('success'),
        standardWarning: standardStyle('warning'),
        standardError: standardStyle('error'),

        filledInfo: filledStyle('info'),
        filledSuccess: filledStyle('success'),
        filledWarning: filledStyle('warning'),
        filledError: filledStyle('error'),

        outlinedInfo: outlinedStyle('info'),
        outlinedSuccess: outlinedStyle('success'),
        outlinedWarning: outlinedStyle('warning'),
        outlinedError: outlinedStyle('error'),
      },
    },
  };
}
