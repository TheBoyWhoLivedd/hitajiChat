import {
  Stack,
  Box,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import React, { useState, useRef, forwardRef, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import { SimpleBarStyle } from "@/components/dashboard/Scrollbar";

import { ChatHeader, ChatFooter } from "@/components/chatComponents";
import useResponsive from "@/utils/hooks/useResponsive";
import {
  TextMsg,
  TypingTextMsg,
} from "@/components/chatComponents/conversationFeatures";
import { useDispatch, useSelector } from "react-redux";
import NoChat from "@/components/dashboard/NoChat";
import { setIsTyping, showSnackbar } from "../../redux/slices/app";
import axios from "axios";
import { updateChatTitle } from "../../redux/slices/chats";
import { addMessage } from "../../redux/slices/chats";
import { useRouter } from "next/router";
import { ChatProps, Message } from "../../../types";
import { RootState } from "@/redux/rootReducer";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { ChangeEvent } from "react";
import { FormEvent } from "react";
import { responseAtom } from "@/utils/store";
import { useAtom } from "jotai";

const Conversation = forwardRef<
  HTMLPreElement,
  {
    isMobile: boolean | null;
    menu: boolean;
    messages: Message[] | undefined;
    response: string;
  }
>(({ isMobile, menu, messages, response }, ref) => {
  const handleNewChatButtonClick = () => {};
  const theme = useTheme();
  const router = useRouter();
  const { query } = router;
  const chatId = query.id;
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const userName = useSelector((state: RootState) => state.user.user?.name);
  const dispatch =
    useDispatch<ThunkDispatch<RootState, undefined, AnyAction>>();
  const [files, setFiles] = useState<File | null>(null);
  const [numFilesSelected, setNumFilesSelected] = useState(0);
  const [fileUploading, setFileUploading] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFiles(files[0]);
      setNumFilesSelected(files.length);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    if (files && numFilesSelected > 0) {
      formData.append("pdf", files);
      try {
        console.log(
          "🚀 ~ file: Conversation.tsx:57 ~ handleSubmit ~ userName:",
          userName
        );
        setFileUploading(true);
        let res = await axios.post(
          `https://www.upload.hitajitech.site`,
          formData
        );
        // console.log(res);
        // http://localhost:3500
        const content = {
          pdfContent: res.data.content,
          originalFileName: res.data.originalFileName,
        };
        // console.log(content);
        let response = await axios.post(
          `api/upload/${userId}/${chatId}/${userName}`,
          content
        );
        setFiles(null);

        console.log(
          "🚀 ~ file: Conversation.tsx:45 ~ handleSubmit ~ response:",
          response
        );

        const title = response.data.message;
        const data = {
          title,
        };
        const messageToRedux = response.data.content;
        dispatch(setIsTyping());
        dispatch(addMessage({ chatId, messageToRedux }));
        setFileUploading(false);
        response = await axios.patch(`/api/chats/${userId}/${chatId}`, data);
        dispatch(updateChatTitle({ chatId, title }));
        dispatch(
          showSnackbar({
            severity: "success",
            message: response.data.message,
          })
        );
      } catch (error: any) {
        dispatch(showSnackbar({ severity: "error", message: error.message }));
        setFileUploading(false);
      }
    } else {
      dispatch(
        showSnackbar({ severity: "error", message: "please select a file" })
      );
      // handleClose();
    }
  };

  return (
    <Box p={isMobile ? 1 : 3} height={"100%"}>
      {messages && messages?.length > 0 ? (
        <>
          <Stack spacing={3}>
            {messages?.map((message) => {
              return (
                <TextMsg
                  ref={ref}
                  message={message}
                  menu={menu}
                  key={message?._id}
                />
              );
            })}
            {response && (
              <TypingTextMsg
                ref={ref}
                message={response}
                menu={menu}
                role="assistant"
                key={messages[messages?.length - 1]?._id}
                // lastMessage
              />
            )}
          </Stack>
        </>
      ) : (
        <Stack
          spacing={2}
          sx={{ height: "100%", width: "100%" }}
          alignItems="center"
          justifyContent={"center"}
        >
          <NoChat />
          {!fileUploading && (
            <form onSubmit={handleSubmit}>
              <Stack direction="row" alignItems="center">
                <Button variant="outlined" component="label">
                  <Typography
                    variant="subtitle2"
                    sx={{ textTransform: "none" }}
                    component="span"
                  >
                    Select a Document
                  </Typography>
                  <input type="file" hidden onChange={handleFileChange} />
                </Button>
                <Typography
                  variant="subtitle2"
                  sx={{
                    textTransform: "none",
                    //MUI's theme palette interface doesnt have  .background on palette.primary.
                    //@ts-ignore
                    color: theme.palette.primary.background,
                    marginLeft: 1,
                  }}
                  component="span"
                >
                  {!files
                    ? "No file selected"
                    : `${numFilesSelected} ${
                        numFilesSelected > 1 ? "files" : "file"
                      } selected`}
                </Typography>
              </Stack>
              {files && (
                <Stack
                  alignItems="center"
                  sx={{ paddingTop: 1 }}
                  direction={"row"}
                  justifyContent={"center"}
                >
                  <Button onClick={() => setFiles(null)}>Cancel</Button>
                  <Button type="submit" variant="text">
                    Upload
                  </Button>
                </Stack>
              )}
            </form>
          )}
        </Stack>
      )}
      {fileUploading && (
        <Stack alignItems="center">
          <CircularProgress />
        </Stack>
      )}
    </Box>
  );
});
Conversation.displayName = "Conversation";

const ChatComponent = () => {
  const isMobile = useResponsive("between", "md", "xs", "sm");
  const router = useRouter();
  const { query } = router;
  const chatId = query.id;
  const chats: ChatProps[] = useSelector(
    (state: RootState) => state.chats.chats
  );
  const selectedChat = chats.find((chat) => chat._id === chatId);
  const messages = selectedChat?.messages;
  const [response] = useAtom(responseAtom);

  const messagesEndRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, response]);

  const theme = useTheme();

  return (
    <Stack
      height={"100%"}
      maxHeight={"100vh"}
      width={isMobile ? "100vw" : "auto"}
    >
      {/*  */}
      <ChatHeader />
      <Box
        width={"100%"}
        sx={{
          position: "relative",
          flexGrow: 1,
          overflowY: "scroll",
          overflowX: "hidden",
          height: "100%",
          "&::-webkit-scrollbar": {
            width: !isMobile ? "8px" : "0px",
            height: "8px",
            backgroundColor: "#f5f5f5",
            borderRadius: "5px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor:
              theme.palette.mode === "light"
                ? "#ccc"
                : theme.palette.primary.main,
            borderRadius: "5px",
          },
          "&::-webkit-scrollbar-thumb:vertical": {
            transition: "background-color 0.5s ease-in-out",
          },
          // Specify the duration before scrollbar disappears
          "&::-webkit-scrollbar-thumb:vertical:hover": {
            backgroundColor: theme.palette.primary.main,
            transitionDelay: "1s",
          },

          backgroundColor:
            theme.palette.mode === "light"
              ? "#F0F4FA"
              : theme.palette.background.default,

          boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
        }}
      >
        {/* Simplebar-react libary doesnt seem to have a timeout property. */}
        {/* @ts-ignore */}
        <SimpleBarStyle timeout={500} clickOnTrack={false}>
          <Conversation
            response={response}
            ref={messagesEndRef}
            messages={messages}
            menu={true}
            isMobile={isMobile}
          />
        </SimpleBarStyle>
      </Box>

      {/*  */}
      <ChatFooter />
    </Stack>
  );
};

export default ChatComponent;

export { Conversation };
