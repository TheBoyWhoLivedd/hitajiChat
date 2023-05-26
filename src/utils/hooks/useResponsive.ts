import { useTheme, Theme, Breakpoint } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

type QueryType = 'up' | 'down' | 'between' | 'only';

type UseResponsiveReturnType = boolean | null;

type UseResponsiveFunction = (
  query: QueryType,
  key: Breakpoint,
  start?: Breakpoint | number,
  end?: Breakpoint | number
) => UseResponsiveReturnType;

const useResponsive: UseResponsiveFunction = (query, key, start, end) => {
  const theme = useTheme();

  const mediaUp = useMediaQuery(theme.breakpoints.up(key as Breakpoint));

  const mediaDown = useMediaQuery(theme.breakpoints.down(key as Breakpoint));

  const mediaBetween = useMediaQuery(theme.breakpoints.between(start ?? 0, end ?? 0));

  const mediaOnly = useMediaQuery(theme.breakpoints.only(key as Breakpoint));

  if (query === 'up') {
    return mediaUp;
  }

  if (query === 'down') {
    return mediaDown;
  }

  if (query === 'between') {
    return mediaBetween;
  }

  if (query === 'only') {
    return mediaOnly;
  }

  return null;
};

export default useResponsive;
