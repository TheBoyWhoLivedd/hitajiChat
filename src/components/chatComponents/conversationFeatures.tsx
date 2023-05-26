import React, { useEffect, useLayoutEffect, useState, forwardRef } from "react";
import {
  Stack,
  Box,
  Typography,
  Menu,
  MenuItem,
  IconButton,
  Divider,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import { DotsThreeVertical, DownloadSimple, Image, Star } from "phosphor-react";
import { Message_options } from "../../data";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setIsTyping, showSnackbar } from "@/redux/slices/app";
import {
  addStarredMessage,
  removeStarredMessages,
} from "../../redux/slices/starredMessages";
import { useRouter } from "next/router";
import { updateStarred } from "@/redux/slices/chats";
import { RootState } from "@/redux/rootReducer";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { Message } from "../../../types";

const MessageOption = ({
  messageId,
  starred,
}: {
  messageId: String | undefined;
  starred: Boolean | undefined;
}) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const userId = useSelector((state: RootState) => state.user.user?._id);
  const dispatch =
    useDispatch<ThunkDispatch<RootState, undefined, AnyAction>>();
  const chats = useSelector((state: RootState) => state.chats.chats);
  const router = useRouter();
  const { query } = router;
  const chatId = query.id;
  // Find the chat object with the matching chatId
  const chat = chats.find((c) => c._id === chatId);

  // Access the title property to get its string value
  const title = chat?.title;

  const handleStarClick = async ({
    messageId,
    title,
    starred,
  }: {
    messageId: String | undefined;
    title: string | undefined;
    starred: Boolean | undefined;
  }) => {
    const starredProperty = !starred;
    try {
      const data = {
        starredProperty,
        title,
      };
      const response = await axios.post(
        `api/chats/${userId}/${chatId}/${messageId}`,
        data
      );
      const starredMessage = response.data.starredMessage;
      console.log(
        "🚀 ~ file: conversationFeatures.tsx:57 ~ handleStarClick ~ starredMessage:",
        starredMessage
      );

      // dispatch(updateStarredState({ messageId, chatId }));
      if (starredProperty) {
        dispatch(addStarredMessage(starredMessage));
        dispatch(updateStarred({ messageId, chatId, starredProperty }));
      } else {
        dispatch(removeStarredMessages({ messageId }));
        dispatch(updateStarred({ messageId, chatId, starredProperty }));
      }

      dispatch(
        showSnackbar({
          severity: "success",
          message: starredProperty ? "Chat Starred" : "Chat UnStarred",
        })
      );
    } catch (error: any) {
      dispatch(showSnackbar({ severity: "error", message: error.message }));
    }
  };

  const handleCopyClick = () => {};
  const handleShareClick = () => {};

  const handleClose = () => {
    setAnchorEl(null);
  };
  const pointerStyle = { cursor: "pointer" };
  return (
    <>
      <DotsThreeVertical
        size={20}
        id="basic-button"
        aria-controls={open ? "basic-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        style={pointerStyle}
      />
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
      >
        <Stack spacing={1} px={1}>
          <MenuItem onClick={handleCopyClick}>Copy</MenuItem>
          <MenuItem onClick={handleShareClick}>Share</MenuItem>
          <MenuItem
            onClick={() => handleStarClick({ messageId, starred, title })}
          >
            {!starred ? "Star Chat" : "Un-star Chat"}
          </MenuItem>
        </Stack>
      </Menu>
    </>
  );
};

const TextMsg = forwardRef<HTMLPreElement, { message: Message; menu: Boolean }>(
  ({ message, menu }, ref) => {
    const theme = useTheme();
    return (
      <Stack
        direction="row"
        justifyContent={message.role === "assistant" ? "start" : "end"}
      >
        <Box
          px={1.5}
          py={1.5}
          sx={{
            backgroundColor:
              message.role === "assistant"
                ? alpha(theme.palette.background.default, 1)
                : theme.palette.primary.main,
            borderRadius: 1.5,
            width: "max-content",
          }}
        >
          <Stack>
            <pre
              ref={ref}
              style={{
                margin: 0,
                fontSize: "0.875rem",
                fontFamily: "inherit",
                whiteSpace: "pre-wrap",
              }}
            >
              <Typography
                color={
                  message.role === "assistant"
                    ? theme.palette.text.primary
                    : "#fff"
                }
              >
                {message.content}
              </Typography>
            </pre>
            <Stack alignSelf={"flex-end"}>
              {message.starred && <Star weight="fill" color="grey" />}
            </Stack>
          </Stack>
        </Box>
        {menu && (
          <MessageOption messageId={message._id} starred={message.starred} />
        )}
      </Stack>
    );
  }
);
TextMsg.displayName = "TextMsg";

const TypingTextMsg = forwardRef<
  HTMLPreElement,
  { message: string; role: string; menu: boolean }
>(({ message, role = "assistant", menu }, ref) => {
  const isTyping = useSelector((state: RootState) => state.app.isTyping);
  const theme = useTheme();
  const dispatch = useDispatch();
  const [displayedChars, setDisplayedChars] = useState(0);

  let intervalId: number | null = null;

  return (
    <Stack
      direction="row"
      justifyContent={role === "assistant" ? "start" : "end"}
    >
      <Box
        px={1.5}
        py={1.5}
        sx={{
          backgroundColor:
            role === "assistant"
              ? alpha(theme.palette.background.default, 1)
              : theme.palette.primary.main,
          borderRadius: 1.5,
          width: "max-content",
        }}
      >
        <Stack>
          <pre
            ref={ref}
            style={{
              margin: 0,
              fontSize: "0.875rem",
              fontFamily: "inherit",
              // color: role === "assistant" ? theme.palette.text.primary : "#fff",
              whiteSpace: "pre-wrap",
            }}
          >
            <Typography
              color={role === "assistant" ? theme.palette.text.primary : "#fff"}
            >
              {message}
            </Typography>
          </pre>
          {/* <Stack alignSelf={"flex-end"}>
            {message.starred && <Star weight="fill" color="grey" />}
          </Stack> */}
        </Stack>
      </Box>
      {/* {menu && (
        <MessageOption messageId={message._id} starred={message.starred} />
      )} */}
    </Stack>
  );
});

TypingTextMsg.displayName = "TypingTextMsg";
export { TextMsg, TypingTextMsg };
