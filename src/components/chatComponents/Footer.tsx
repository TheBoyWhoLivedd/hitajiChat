import {
  Box,
  Fab,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import {
  Camera,
  File,
  Image,
  LinkSimple,
  PaperPlaneTilt,
  Smiley,
  Sticker,
  User,
} from "phosphor-react";
import { useTheme, styled } from "@mui/material/styles";
import React, { useRef, useState } from "react";
import useResponsive from "@/utils/hooks/useResponsive";
import { v4 as uuidv4 } from "uuid";
import data from "@emoji-mart/data";
import Picker from "@emoji-mart/react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setIsTyping, showSnackbar } from "../../redux/slices/app";
import { addMessage, updateChatTitle } from "../../redux/slices/chats";
import UploadDocumentDialog from "../dialogs/UploadDocumentDialog";
import { useRouter } from "next/router";
import { RootState } from "@/redux/rootReducer";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { ChatProps, Message } from "../../../types";
import { responseAtom } from "@/utils/store";
import { useAtom } from "jotai";

//the messages object from front end is different from the one on backend.
//I need to define a separate type for the message object on front end but cant because i cant chat

const Actions = [
  {
    color: "#4da5fe",
    icon: <Image size={24} />,
    y: 102,
    title: "Photo/Video",
  },
  {
    color: "#1b8cfe",
    icon: <Sticker size={24} />,
    y: 172,
    title: "Stickers",
  },
  {
    color: "#0172e4",
    icon: <Camera size={24} />,
    y: 242,
    title: "Image",
  },

  {
    color: "#0159b2",
    icon: <File size={24} />,
    y: 312,
    title: "Document",
  },
  {
    color: "#013f7f",
    icon: <User size={24} />,
    y: 382,
    title: "Contact",
  },
];
const StyledInput = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-input": {
    paddingTop: "12px !important",
    paddingBottom: "12px !important",
  },
  "& .MuiInputBase-root": {
    borderRadius: "8px !important",
  },
}));
const ChatInput = ({ chatId }: { chatId: string | string[] | undefined }) => {
  const [openActions, setOpenActions] = React.useState(false);
  const [_response, setResponse] = useAtom(responseAtom);
  const dispatch =
    useDispatch<ThunkDispatch<RootState, undefined, AnyAction>>();
  const inputRef = useRef<HTMLInputElement>(null);

  const userId = useSelector((state: RootState) => state.user.user?._id);
  const theme = useTheme();

  const chats = useSelector((state: RootState) => state.chats.chats);

  const handleEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const textFieldValue = inputRef.current?.value;
      if (textFieldValue && textFieldValue.trim() !== "") {
        handleMessageSent({ chats, chatId });
      }
    }
  };
  const handleMessageSent = async ({
    chats,
    chatId,
  }: {
    chats: ChatProps[];
    chatId: string | string[] | undefined;
  }) => {
    const textFieldValue = inputRef.current?.value;
    try {
      const content = textFieldValue as string;
      const role = "user";
      const starred = false;
      const _id = uuidv4(); // generate a unique ID using the uuid library

      let messageToRedux: Message = { content, role, starred, _id };
      const chat = chats.find((chat) => {
        return chat._id === chatId;
      });
      if (chat) {
        const messages = chat.messages;
        const isTitleUpdated = chat.isTitleUpdated;
        const updatedMessages = [...messages, messageToRedux];
        let data = {
          messages: updatedMessages,
        };
        dispatch(addMessage({ chatId, messageToRedux }));
        if (inputRef.current) {
          inputRef.current.value = "";
        }
        const queryResponse = await axios.post(
          `/api/query/${userId}/${chatId}`,
          {
            data,
          }
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
          console.log("Chunk Value", _response);
        }

        //send messageToredux and the _response to the backend for saving

        const response = await axios.post(`/api/save/${userId}/${chatId}`, {
          messageToRedux,
          fullResponse,
        });
        messageToRedux = response.data.lastMessage;
        dispatch(addMessage({ chatId, messageToRedux }));
        setResponse("");

        // update the chat title if it hasn't been updated before
        if (!isTitleUpdated) {
          const maxLength = 11; // maximum number of characters to show in the title
          let title = content.substring(0, maxLength); // extract first maxLength characters
          title = title.toLowerCase();
          if (content.length > maxLength) {
            title += "..."; // add ellipsis if message is longer than maxLength
          }
          const data = {
            title,
          };
          const response = await fetch(`/api/save/${userId}/${chatId}`, {
            method: "PUT",
            body: JSON.stringify(data),
            headers: {
              "Content-Type": "application/json",
              // Include other headers as needed
            },
          });
          dispatch(updateChatTitle({ chatId, title }));
        }
      }

      // dispatch(
      //   showSnackbar({ severity: "success", message: response.data.message })
      // );
    } catch (error: any) {
      dispatch(showSnackbar({ severity: "error", message: error.message }));
    }
  };
  const [openDelete, setOpenDelete] = useState(false);

  const handleCloseDelete = () => {
    setOpenDelete(false);
  };

  return (
    <>
      <StyledInput
        onKeyDown={handleEnter}
        fullWidth
        placeholder="Write a message..."
        variant="filled"
        inputRef={inputRef}
        InputProps={{
          disableUnderline: true,
          startAdornment: <Stack sx={{ width: "max-content" }}></Stack>,
          endAdornment: (
            <Stack sx={{ position: "relative" }}>
              <InputAdornment position="end">
                <IconButton
                  onClick={() => handleMessageSent({ chats, chatId })}
                >
                  <PaperPlaneTilt
                    weight="fill"
                    color={theme.palette.primary.main}
                  />
                </IconButton>
              </InputAdornment>
            </Stack>
          ),
        }}
      />
      {openDelete && (
        <UploadDocumentDialog
          open={openDelete}
          handleClose={handleCloseDelete}
        />
      )}
    </>
  );
};

const Footer = () => {
  const isMobile = useResponsive("between", "md", "xs", "sm");
  const { sideBar } = useSelector((state: RootState) => state.app);
  const theme = useTheme();
  const router = useRouter();
  const { query } = router;
  const chatId = query.id;
  const chats = useSelector((state: RootState) => state.chats.chats);
  const chat = chats.find((chat) => chat._id === chatId);
  const messages = chat?.messages;
  const [openPicker, setOpenPicker] = React.useState(false);

  return (
    <Box
      sx={{
        position: "relative",
        backgroundColor: "transparent !important",
      }}
    >
      <Box
        p={isMobile ? 1 : 2}
        width={"100%"}
        sx={{
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background.default,
          boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
        }}
      >
        <Stack direction="row" alignItems={"center"} spacing={isMobile ? 1 : 3}>
          <Stack sx={{ width: "100%" }} direction="row" spacing={1}>
            <Box
              style={{
                zIndex: 10,
                position: "fixed",
                display: openPicker ? "inline" : "none",
                bottom: 81,
                right: isMobile ? 20 : sideBar.open ? 420 : 100,
              }}
            >
              <Picker
                theme={theme.palette.mode}
                data={data}
                onEmojiSelect={console.log}
              />
            </Box>
            {/* Chat Input */}
            {messages && messages?.length > 0 && <ChatInput chatId={chatId} />}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default Footer;
