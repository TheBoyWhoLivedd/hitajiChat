import React from "react";
import { Avatar, Box, Fade, Menu, MenuItem, Stack } from "@mui/material";
import { Profile_Menu } from "../../data";
import { useDispatch, useSelector } from "react-redux";
// import { LogoutUser, googleLogIn } from "../../redux/slices/auth";
import useResponsive from "@/utils/hooks/useResponsive";
import { signOut } from "next-auth/react";
import { logoutUser } from "@/redux/slices/user";
import { RootState } from "@/redux/rootReducer";
import { useRouter } from "next/router";
// import { auth } from "../../utils/firebase";

const ProfileMenu = () => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const router = useRouter();

  const openMenu = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    signOut();

    // Dispatch the LogoutUser action
    dispatch(logoutUser());
  };
  const isDesktop = useResponsive("up", "md");
  const user = useSelector((state: RootState) => state.user.user);

  return (
    <>
      <Avatar
        id="profile-positioned-button"
        aria-controls={openMenu ? "profile-positioned-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={openMenu ? "true" : undefined}
        alt={user?.name}
        src={user?.image}
        onClick={handleClick}
        sx={{ cursor: "pointer" }}
      />
      <Menu
        MenuListProps={{
          "aria-labelledby": "fade-button",
        }}
        TransitionComponent={Fade}
        id="profile-positioned-menu"
        aria-labelledby="profile-positioned-button"
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleClose}
        anchorOrigin={
          isDesktop
            ? {
                vertical: "bottom",
                horizontal: "right",
              }
            : {
                vertical: "top",
                horizontal: "left",
              }
        }
        transformOrigin={
          isDesktop
            ? {
                vertical: "bottom",
                horizontal: "left",
              }
            : {
                vertical: "bottom",
                horizontal: "right",
              }
        }
      >
        <Box p={1}>
          <Stack spacing={1}>
            {Profile_Menu.map((el) => (
              <MenuItem key={el.title}>
                <Stack
                  onClick={() => {
                    if (el.link !== "/sign-out") {
                      router.push(el.link);
                    } else {
                      handleSignOut();
                    }
                  }}
                  sx={{ width: 100 }}
                  direction="row"
                  alignItems={"center"}
                  justifyContent="space-between"
                >
                  <span>{el.title}</span>
                  {el.icon}
                </Stack>{" "}
              </MenuItem>
            ))}
          </Stack>
        </Box>
      </Menu>
    </>
  );
};

export default ProfileMenu;
