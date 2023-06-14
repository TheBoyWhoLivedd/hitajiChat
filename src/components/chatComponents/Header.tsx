import React, { useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  Fade,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  styled,
  Tooltip,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  CaretDown,
  CaretLeft,
  Info,
  MagnifyingGlass,
  Phone,
  PushPin,
  Trash,
  VideoCamera,
} from "phosphor-react";
import useResponsive from "@/utils/hooks/useResponsive";
import {
  setChatsBar,
  setIsTyping,
  showSnackbar,
  ToggleSidebar,
} from "../../redux/slices/app";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import {
  addMessage,
  updateIsSummarized,
  updatePinState,
} from "../../redux/slices/chats";
import DeleteChatDialog from "../dialogs/DeleteChatDialog";
import { useRouter } from "next/router";
import { addChat } from "@/redux/slices/chats";
import { RootState } from "@/redux/rootReducer";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { useAtom } from "jotai";
import { responseAtom } from "@/utils/store";

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    "&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },
  },
  "@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },
}));

const Conversation_Menu = [
  {
    title: "Clear messages",
  },
  {
    title: "Delete chat",
  },
];

const ChatHeader = () => {
  const [openDelete, setOpenDelete] = useState(false);
  const [_response, setResponse] = useAtom(responseAtom);
  const dispatch =
    useDispatch<ThunkDispatch<RootState, undefined, AnyAction>>();
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const isMobile = useResponsive("between", "md", "xs", "sm");
  const isDesktop = useResponsive("up", "md");
  const theme = useTheme();
  const [deleting, setDeleting] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const chats = useSelector((state: RootState) => state.chats.chats);
  const [conversationMenuAnchorEl, setConversationMenuAnchorEl] =
    React.useState(null);
  const router = useRouter();
  const { query, pathname } = router;
  const openConversationMenu = Boolean(conversationMenuAnchorEl);
  // Didnt check this because its unused
  //@ts-ignore
  const handleClickConversationMenu = (event) => {
    setConversationMenuAnchorEl(event.currentTarget);
  };
  const handleCloseConversationMenu = () => {
    setConversationMenuAnchorEl(null);
  };

  const handleButtonClick = () => {
    dispatch(setChatsBar());
  };
  const handleCloseDelete = () => {
    setOpenDelete(false);
  };
  const chatId = query.id;
  const chat = chats.find((chat) => chat._id === chatId);
  const isPinned = chat && chat.pinned;
  const isSummarized = chat && chat.isSummarized;
  const user = useSelector((state: RootState) => state.user.user);

  const handlePushPin = async () => {
    try {
      const pinned = chat && !chat.pinned;
      const data = {
        pinned,
      };
      const response = await axios.patch(
        `/api/chats/${userId}/${chatId}/pin`,
        data
      );

      dispatch(updatePinState({ chatId }));

      dispatch(
        showSnackbar({
          severity: "success",
          message: pinned ? "Chat Pinned" : "Chat Unpinned",
        })
      );
    } catch (error: any) {
      dispatch(showSnackbar({ severity: "error", message: error.message }));
    }
  };

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

  const handleSummarizeButtonClick = async (
    chatId: string | string[] | undefined
  ) => {
    try {
      setSummarizing(true);
      const queryResponse = await axios.post(
        `/api/summarize/${userId}/${chatId}`,
        {}
      );

      const prompt = { gpt: queryResponse.data.gptMessages };
      console.log("This is the Prompt", prompt);
      const res = await fetch(`/api/chats/${userId}/${chatId}`, {
        method: "POST",
        body: JSON.stringify(prompt),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error(res.statusText);
      console.log(res.body);

      const streamData = res.body;
      if (!streamData) return;

      const reader = streamData.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let fullResponse = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        fullResponse += chunkValue;
        setResponse((prev) => prev + chunkValue);
        console.log("Response", fullResponse);
      }

      const response = await axios.post(`/api/save/${userId}/${chatId}`, {
        fullResponse,
        isSummary: true,
      });
      const messageToRedux = response.data.lastMessage;
      dispatch(addMessage({ chatId, messageToRedux }));
      setResponse("");
      dispatch(setIsTyping());
      dispatch(updateIsSummarized({ chatId }));
      // dispatch(
      //   showSnackbar({ severity: "success", message: response.data.message })
      // );
      setSummarizing(false);
    } catch (error: any) {
      dispatch(showSnackbar({ severity: "error", message: error.message }));
      setSummarizing(false);
    }
  };

  return (
    <Box
      p={2}
      width={"100%"}
      display="flex"
      sx={{
        backgroundColor:
          theme.palette.mode === "light"
            ? "#F8FAFF"
            : theme.palette.background.default,
        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
      }}
    >
      <IconButton onClick={handleButtonClick}>
        {!isDesktop && <CaretLeft />}
      </IconButton>
      <Stack
        alignItems={"center"}
        direction={"row"}
        sx={{ width: "100%", height: "100%" }}
        justifyContent="space-between"
      >
        <Stack
          direction={"row"}
          alignItems="center"
          width={"100%"}
          justifyContent="space-between"
          spacing={isMobile ? 1 : 3}
        >
          {isDesktop ? (
            <>
              <Button
                variant="contained"
                sx={{ width: "max-content", p: "1" }}
                onClick={handleNewChatButtonClick}
              >
                New Chat
              </Button>
              {!isSummarized && !summarizing && (
                <Button
                  variant="contained"
                  sx={{ width: "max-content", p: "1" }}
                  onClick={() => handleSummarizeButtonClick(chatId)}
                >
                  Summarize
                </Button>
              )}
              {summarizing && <CircularProgress />}
            </>
          ) : (
            <>
              <Tooltip title="Create new chat">
                <Button
                  variant="contained"
                  sx={{
                    borderRadius: "50%",
                    padding: "12px",
                    minWidth: "auto",
                    width: "30px",
                    height: "30px",
                  }}
                  onClick={handleNewChatButtonClick}
                >
                  <Typography variant="h5" component="span">
                    +
                  </Typography>
                </Button>
              </Tooltip>
              {!isSummarized && !summarizing && (
                <Tooltip title="Summarize chat">
                  <Button
                    variant="contained"
                    sx={{
                      borderRadius: "50%",
                      padding: "12px",
                      minWidth: "auto",
                      width: "30px",
                      height: "30px",
                    }}
                    onClick={() => handleSummarizeButtonClick(chatId)}
                  >
                    <Typography variant="h5" component="span">
                      S
                    </Typography>
                  </Button>
                </Tooltip>
              )}
              {summarizing && <CircularProgress />}
            </>
          )}
          <Tooltip title="Pin chat">
            <IconButton onClick={handlePushPin}>
              {isPinned ? (
                <PushPin weight="fill" color={theme.palette.primary.main} />
              ) : (
                <PushPin />
              )}
            </IconButton>
          </Tooltip>
          {deleting ? (
            <CircularProgress />
          ) : (
            <Tooltip title="Delete chat">
              <IconButton
                onClick={() => {
                  setOpenDelete(true);
                }}
              >
                <Trash />
              </IconButton>
            </Tooltip>
          )}

          <Tooltip title="Chat Info">
            <IconButton
              onClick={() => {
                dispatch(ToggleSidebar());
              }}
            >
              <Info />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      {openDelete && (
        <DeleteChatDialog open={openDelete} handleClose={handleCloseDelete} />
      )}
    </Box>
  );
};

export default ChatHeader;
