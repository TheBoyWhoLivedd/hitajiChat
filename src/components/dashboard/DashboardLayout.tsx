import React, { ReactNode } from "react";
import { Stack } from "@mui/material";
import useResponsive from "@/utils/hooks/useResponsive";
import SideNav from "./SideNav";

const DashboardLayout = ({ children }:{ children: ReactNode }) => {
  const isMobile = useResponsive("between", "md", "xs", "sm");
  return (
    <>
      <Stack direction="row">
        {!isMobile && (
          // SideBar
          <SideNav />
        )}
        {children}
      </Stack>
    </>
  );
};

export default DashboardLayout;
