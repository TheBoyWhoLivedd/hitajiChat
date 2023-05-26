import React from "react";
import { useTheme } from "@mui/material/styles";

import { Box, Divider, IconButton, Stack, Tooltip } from "@mui/material";

import Logo from "../../assets/Images/logo.ico";

import useSettings from "@/utils/hooks/useSettings";
import { Nav_Buttons } from "../../data";

import ProfileMenu from "./ProfileMenu";
import { useDispatch, useSelector } from "react-redux";
import { Moon, SunDim } from "phosphor-react";
import { changeDarkModeIcon } from "../../redux/slices/app";
// import { updatePath } from "../../redux/slices/user";
import Image from "next/image";
import Link from "@/utils/Link";
import { RootState } from "@/redux/rootReducer";

// const getPath = (index) => {
//   switch (index) {
//     case 0:
//       return "/app";

//     case 1:
//       return "/app";

//     case 2:
//       return "/app";

//     case 3:
//       return "/app";

//     default:
//       break;
//   }
// };

const SideBar = () => {
  const theme = useTheme();

  const isDarkMode = useSelector((state: RootState) => state.app.isDarkMode);
  const dispatch = useDispatch();

  const { onToggleMode } = useSettings();

  const [selectedTab, setSelectedTab] = React.useState(0);

  const handleChangeTab = (el: any) => {
    const index = el.index;
    const path = el.path;
    setSelectedTab(index);
    // dispatch(updatePath(`${path}`));
  };

  return (
    <Box
      sx={{
        height: "100vh",
        width: 100,

        backgroundColor:
          theme.palette.mode === "light"
            ? "#F0F4FA"
            : theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
      }}
    >
      <Stack
        py={3}
        alignItems={"center"}
        justifyContent="space-between"
        sx={{ height: "100%" }}
      >
        <Stack alignItems={"center"} spacing={4}>
          <Link href="/dashboard">
            <Image
              src="/hitajiLogo.svg"
              alt="hitaji logo"
              width={50}
              height={50}
            />
          </Link>
          <Stack
            sx={{ width: "max-content" }}
            direction="column"
            alignItems={"center"}
            spacing={3}
          >
            {Nav_Buttons.map((el) => {
              return el.index === selectedTab ? (
                <Box
                  sx={
                    {
                      // backgroundColor: theme.palette.primary.main,
                      // borderRadius: 1.5,
                    }
                  }
                  p={1}
                  key={el.index}
                >
                  <Tooltip title={el.description} placement="right">
                    <IconButton
                      onClick={() => {}}
                      sx={{
                        width: "max-content",
                        color: theme.palette.primary.main,
                      }}
                    >
                      {el.icon}
                    </IconButton>
                  </Tooltip>
                </Box>
              ) : (
                <Tooltip
                  title={el.description}
                  placement="right"
                  key={el.index}
                >
                  <IconButton
                    onClick={() => {
                      handleChangeTab(el);
                    }}
                    sx={{
                      width: "max-content",
                      color:
                        theme.palette.mode === "light"
                          ? // ? "#080707"
                            "grey"
                          : theme.palette.text.primary,
                    }}
                    key={el.index}
                  >
                    {el.icon}
                  </IconButton>
                </Tooltip>
              );
            })}
            {/* <Divider sx={{ width: 48 }} /> */}
            <Tooltip title="dark/light mode" placement="right">
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
            </Tooltip>
          </Stack>
        </Stack>
        <Stack spacing={4}>
          {/* <AntSwitch
            defaultChecked={theme.palette.mode === "dark"}
            onChange={onToggleMode}
          /> */}
          {/* Profile Menu */}
          <ProfileMenu />
        </Stack>
      </Stack>
    </Box>
  );
};

export default SideBar;
