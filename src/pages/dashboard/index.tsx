//General Application
import React, { useCallback, useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { Box, Button, Stack, Typography } from "@mui/material";
import ChatComponent from "@/components/dashboard/Conversation";
import ChatSection from "@/components/dashboard/ChatsSection";
import Contact from "@/components/dashboard/Contact";
import NoChat from "@/components/dashboard/NoChat";
import { useDispatch, useSelector } from "react-redux";
import StarredMessages from "@/components/dashboard/StarredMessages";
import useResponsive from "@/utils/hooks/useResponsive";
import axios from "axios";
import { AppState } from "../../../types";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useSession } from "next-auth/react";
import { UserObject } from "../../../types";
import { updateUser } from "@/redux/slices/user";
import { addChat, updateChats } from "@/redux/slices/chats";
import { setChatsBar, showSnackbar } from "@/redux/slices/app";
import { useRouter } from "next/router";
import { updateStarredMessages } from "@/redux/slices/starredMessages";
import { RootState } from "@/redux/rootReducer";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

// import {  updateUserChats } from "../../redux/slices/auth";
// import { setChatsBar, showSnackbar } from "../../redux/slices/app";

const GeneralApp = () => {
  const dispatch =
    useDispatch<ThunkDispatch<RootState, undefined, AnyAction>>();
  const { data: session } = useSession();
  const snackbar = useSelector((state: RootState) => state.app.snackbar);
  //kickstarting server hosted on shared hosting so uploading a document doesnt take time
  async function startServer() {
    let response = await axios.get(`https://www.upload.hitajitech.site`);
    // console.log(response);
  }
  useEffect(() => {
    startServer();
    // Set an interval to call it every 5 minutes
    const intervalId = setInterval(startServer, 5 * 60 * 1000);
    // Clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []);

  const fetchUserDataAndChats = useCallback(async () => {
    try {
      let response = await axios.post("/api/user", {
        email: session?.user?.email,
      });
      const user: UserObject = response.data;
      console.log("Fetching user data in modified implementation");
      dispatch(updateUser(user));
      response = await axios.post("/api/chats", {
        userId: user?._id,
      });
      const chats = response.data;
      dispatch(updateChats(chats));
      response = await axios.post("/api/chats/starred-chats", {
        userId: user?._id,
      });
      const starredMessages = response.data;
      if (starredMessages.length > 0) {
        dispatch(updateStarredMessages(starredMessages));
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    }
  }, [session, dispatch]);

  // Fetch user data and chats only when session data changes
  useEffect(() => {
    if (session) {
      fetchUserDataAndChats();
    }
  }, [session, fetchUserDataAndChats]);

  const isMobile = useResponsive("between", "md", "xs", "sm");
  const theme = useTheme();

  const { sideBar, isChatsBarOpen } = useSelector(
    (state: RootState) => state.app
  );
  const router = useRouter();
  const { query, pathname } = router;

  const user = useSelector((state: RootState) => state.user.user);

  const handleNewChatButtonClick = async () => {
    query.type = "individual-chat";
    try {
      const response = await axios.post(`api/chats/new-chat`, {
        userId: user?._id,
      });
      const newChat = response.data.chat;
      query.id = newChat._id;
      dispatch(addChat(newChat));
      router.replace({ pathname, query }, undefined, { shallow: true });

      if (isMobile) {
        dispatch(setChatsBar());
      }
      dispatch(
        showSnackbar({ severity: "success", message: response.data.message })
      );
    } catch (error: any) {
      dispatch(showSnackbar({ severity: "error", message: error.message }));
    }
  };

  // Access the 'type' and 'id' query parameters
  const type = query.type;
  const id = query.id;

  return (
    <DashboardLayout>
      <Stack direction="row" sx={{ width: "100%" }}>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          style={{ top: "70px" }}
        >
          <Alert
            severity={snackbar.severity}
            sx={{
              width: "100%",
              backgroundColor: snackbar.severity === "error" ? "red" : "green",
              color: snackbar.severity === "error" ? "black" : "white",
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        {isChatsBarOpen || (!isChatsBarOpen && !isMobile) ? (
          <ChatSection isMobile={isMobile} userId={user?._id} />
        ) : null}

        {!isChatsBarOpen || (isChatsBarOpen && !isMobile) ? (
          <Box
            sx={{
              height: "100%",
              width:
                !isChatsBarOpen && isMobile
                  ? "100vw"
                  : sideBar.open
                  ? `calc(100vw - 740px)`
                  : `calc(100vw - 420px)`,
              backgroundColor:
                theme.palette.mode === "light"
                  ? "#FFF"
                  : theme.palette.background.paper,
              borderBottom: "0px",
            }}
          >
            {type === "individual-chat" && id ? (
              <ChatComponent />
            ) : (
              <Stack
                spacing={2}
                sx={{ height: "100%", width: "100%" }}
                alignItems="center"
                justifyContent={"center"}
              >
                <NoChat />
                <Typography variant="subtitle2">
                  Select a chat or start a{" "}
                  <Button onClick={handleNewChatButtonClick}>new one</Button>
                </Typography>
              </Stack>
            )}
          </Box>
        ) : null}
      </Stack>
    </DashboardLayout>
  );
};

export default GeneralApp;
