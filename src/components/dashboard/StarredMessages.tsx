import React from "react";
import { useTheme } from "@mui/material/styles";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { ArrowLeft } from "phosphor-react";
import useResponsive from "../../utils/hooks/useResponsive";
import { useDispatch, useSelector } from "react-redux";
import { UpdateSidebarType } from "../../redux/slices/app";
import { Conversation } from "./Conversation";
import { useSearchParams } from "react-router-dom";
import { RootState } from "@/redux/rootReducer";

const StarredMessages = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const chatId = searchParams.get("id");
  const chats = useSelector((state: RootState) => state.chats.chats);
  const chat = chats.find((chat) => chat._id === chatId);

  const starredMessages =
    chat && chat.messages.filter((message) => message.starred);

  const theme = useTheme();

  const isDesktop = useResponsive("up", "md");
  const isMobile = useResponsive("between", "md", "xs", "sm");

  return (
    <Box
      sx={{
        width: !isDesktop ? "100vw" : 320,
        maxHeight: "100vh",

        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
      }}
    >
      <Stack sx={{ height: "100%" }}>
        <Box
          sx={{
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
            width: "100%",
            backgroundColor:
              theme.palette.mode === "light" ? "#F8FAFF" : "#212B36",
          }}
        >
          <Stack
            sx={{ height: "100%", p: 2 }}
            direction="row"
            alignItems={"center"}
            spacing={3}
          >
            <IconButton
              onClick={() => {
                dispatch(UpdateSidebarType("CONTACT"));
              }}
            >
              <ArrowLeft />
            </IconButton>
            <Typography variant="subtitle2">Starred Messages</Typography>
          </Stack>
        </Box>
        <Stack
          sx={{
            height: "100%",
            position: "relative",
            flexGrow: 1,
            overflow: "scroll",
            backgroundColor:
              theme.palette.mode === "light" ? "#F0F4FA" : "#212B36",
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
          }}
          spacing={3}
        >
          <Conversation
            response=""
            messages={starredMessages}
            isMobile={isMobile}
            menu={true}
          />
        </Stack>
      </Stack>
    </Box>
  );
};

export default StarredMessages;
