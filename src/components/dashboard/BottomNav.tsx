import React from "react";
import { useTheme } from "@mui/material/styles";
import { Box, IconButton, Stack } from "@mui/material";
import ProfileMenu from "./ProfileMenu";
import { Nav_Buttons } from "@/data";
import { useDispatch, useSelector } from "react-redux";
import useSettings from "@/utils/hooks/useSettings";
import { Moon, SunDim } from "phosphor-react";
import { changeDarkModeIcon } from "../../redux/slices/app";
import { RootState } from "@/redux/rootReducer";

const BottomNav = () => {
  const theme = useTheme();

  const [selectedTab, setSelectedTab] = React.useState(0);

  const handleChangeTab = (index: number) => {
    setSelectedTab(index);
  };
  const { onToggleMode } = useSettings();
  const isDarkMode = useSelector((state: RootState) => state.app.isDarkMode);
  const dispatch = useDispatch();
  return (
    <Box
      sx={{
        zIndex: 10,
        position: "absolute",
        bottom: 0,
        width: "100vw",

        backgroundColor: theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
      }}
    >
      <Stack
        sx={{ width: "100%" }}
        direction="row"
        alignItems={"center"}
        justifyContent="space-between"
        spacing={2}
        p={2}
      >
        {Nav_Buttons.map((el) => {
          return el.index === selectedTab ? (
            <Box sx={{}} p={1} key={el.index}>
              <IconButton
                sx={{ width: "max-content", color: theme.palette.primary.main }}
              >
                {el.icon}
              </IconButton>
            </Box>
          ) : (
            <IconButton
              onClick={() => {
                handleChangeTab(el.index);
              }}
              sx={{
                width: "max-content",
                color:
                  theme.palette.mode === "light"
                    ? "grey"
                    : theme.palette.text.primary,
              }}
              key={el.index}
            >
              {el.icon}
            </IconButton>
          );
        })}
        <IconButton
          onClick={() => {
            dispatch(changeDarkModeIcon());
            onToggleMode();
          }}
          sx={{
            color:
              theme.palette.mode === "light"
                ? // ? "#080707"
                  "grey"
                : theme.palette.text.primary,
          }}
        >
          {isDarkMode ? <Moon /> : <SunDim />}
        </IconButton>
        <ProfileMenu />
      </Stack>
    </Box>
  );
};

export default BottomNav;
