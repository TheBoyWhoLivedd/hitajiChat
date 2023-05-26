// @mui
import { Breakpoint, Breakpoints, useTheme } from "@mui/material/styles";
// hooks
import useResponsive from "../utils/hooks/useResponsive";
import {
  ResponsiveFontSizesProps,
  ResponsiveFontSizesResult,
  Typography,
  TypographyVariant,
} from "../../types";

// ----------------------------------------------------------------------

export default function GetFontValue(variant: TypographyVariant) {
  const theme = useTheme();

  const breakpoints = useWidth();

  const key = theme.breakpoints.up(
    breakpoints === "xl" ? "lg" : parseInt(breakpoints, 10)
  );

  const hasResponsive =
    variant === "h1" ||
    variant === "h2" ||
    variant === "h3" ||
    variant === "h4" ||
    variant === "h5" ||
    variant === "h6";

  const getFont: Typography =
    hasResponsive &&
    typeof theme.typography[variant] !== "string" &&
    theme.typography[variant][key]
      ? (theme.typography[variant][key] as Typography)
      : (theme.typography[variant] as Typography);

  const fontSize = remToPx(getFont.fontSize);

  const lineHeight = Number(theme.typography[variant].lineHeight) * fontSize;

  const { fontWeight } = theme.typography[variant];

  const { letterSpacing } = theme.typography[variant];

  return { fontSize, lineHeight, fontWeight, letterSpacing };
}

// ----------------------------------------------------------------------

export function remToPx(value: string): number {
  return Math.round(parseFloat(value) * 16);
}

export function pxToRem(value: number): string {
  return `${value / 16}rem`;
}

export function responsiveFontSizes({
  sm,
  md,
  lg,
}: ResponsiveFontSizesProps): ResponsiveFontSizesResult {
  return {
    "@media (min-width:600px)": {
      fontSize: pxToRem(sm),
    },
    "@media (min-width:900px)": {
      fontSize: pxToRem(md),
    },
    "@media (min-width:1200px)": {
      fontSize: pxToRem(lg),
    },
  };
}
// ----------------------------------------------------------------------

function useWidth() {
  const theme = useTheme();

  const keys = [...theme.breakpoints.keys].reverse();

  return (
    keys.reduce<string | null>((output, key) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const matches = useResponsive("up", key as Breakpoint);

      return !output && matches ? key : output;
    }, null) || "xs"
  );
}
