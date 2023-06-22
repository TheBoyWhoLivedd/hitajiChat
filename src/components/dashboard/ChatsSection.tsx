import React, { useState } from "react";
import {
  Box,
  Button,
  Divider,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { MagnifyingGlass } from "phosphor-react";
import { SimpleBarStyle } from "./Scrollbar";
import { useTheme } from "@mui/material/styles";
import useResponsive from "@/utils/hooks/useResponsive";
import BottomNav from "@/components/dashboard/BottomNav";
import ChatElement from "./ChatElement";
import StarredMessagesElement from "./StarredMessagesElement";
import {
  Search,
  SearchIconWrapper,
  StyledInputBase,
} from "@/components/Search";
// import { Scrollbar } from "react-scrollbars-custom";
import { useDispatch, useSelector } from "react-redux";
import {
  setAllChatsClicked,
  setPinnedClicked,
  setStarredClicked,
} from "@/redux/slices/chatsButtons";
import axios from "axios";
import { setChatsBar, showSnackbar } from "@/redux/slices/app";
import Link from "@/utils/Link";
import { addChat } from "@/redux/slices/chats";
import { useRouter } from "next/router";
import { RootState } from "@/redux/rootReducer";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

const ChatSection = ({
  isMobile,
  userId,
}: {
  isMobile: boolean | null;
  userId: string | undefined;
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { query, pathname } = router;
  // const userId = useSelector((state) => state.auth.user._id);
  //  const userObject = useSelector((state) => state.auth.user);
  //  console.log(userObject)
  const isAllChatsClicked = useSelector(
    (state: RootState) => state.buttons.allChatsClicked
  );
  const isPinnedClicked = useSelector(
    (state: RootState) => state.buttons.pinnedClicked
  );
  const isStarredClicked = useSelector(
    (state: RootState) => state.buttons.starredClicked
  );
  const chats = useSelector((state: RootState) => state.chats.chats);
  const user = useSelector((state: RootState) => state.user.user);
  // console.log(user);
  const starredMessages = useSelector(
    (state: RootState) => state.starredMessages.starredMessages
  );
  const token = useSelector((state: RootState) => state.auth.token);

  const dispatch =
    useDispatch<ThunkDispatch<RootState, undefined, AnyAction>>();

  const handleAllChatsClick = () => {
    dispatch(setAllChatsClicked(true));
  };

  const handlePinnedClick = () => {
    dispatch(setPinnedClicked(true));
  };

  const handleStarredClick = () => {
    dispatch(setStarredClicked(true));
  };

  const [openDialog, setOpenDialog] = useState(false);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  const handleNewChatButtonClick = async (userId: string) => {
    try {
      const response = await axios.post(`api/chats/new-chat`, {
        userId,
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

  let filteredChats, filteredStarredMessages;
  if (searchQuery) {
    // Filter the chats based on search query and clicked state
    filteredChats = chats.filter((chat) => {
      // Check if the chat's title includes the search query
      const searchTerm = searchQuery.toLowerCase().trim();
      const chatTitle = chat.title.toLowerCase();
      return chatTitle.includes(searchTerm);
    });

    // Filter the filtered chats array based on the clicked state
    filteredChats = isPinnedClicked
      ? filteredChats.filter((chat) => chat.pinned)
      : filteredChats;
    // Filter the starred messages based on search query
    filteredStarredMessages = starredMessages.filter((starredMessage) => {
      const searchTerm = searchQuery.toLowerCase().trim();
      const messageContent = starredMessage.chat_title.toLowerCase();
      return messageContent.includes(searchTerm);
    });
  } else {
    // Set the filtered chats array based on clicked state
    filteredChats = isPinnedClicked
      ? chats.filter((chat) => chat.pinned)
      : chats;
    // Set the filtered starred messages array
    filteredStarredMessages = starredMessages;
  }

  return (
    <>
      <Box
        position={"relative"}
        height="100vh"
        width={isMobile ? "100vw" : 320}
        boxShadow="0px 0px 2px rgba(0, 0, 0, 0.25)"
        sx={{
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background.default,
        }}
      >
        {isMobile && (
          // Bottom Nav
          <BottomNav />
        )}

        <Stack p={3} spacing={2} sx={{ maxHeight: "100vh" }}>
          <Stack
            alignItems={"center"}
            justifyContent="space-between"
            direction="row"
          >
            <Link
              href="/dashboard"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Typography sx={{ fontSize: "1.7rem  !important" }} variant="h5">
                Chats
              </Typography>
            </Link>
            <div>
              <Typography variant="body1" sx={{ fontSize: "1rem  !important" }}>
                Credits: {user?.credits}
              </Typography>
            </div>

            <Stack direction={"row"} alignItems="center" spacing={1}>
              {/* <IconButton
                onClick={() => {
                  handleOpenDialog();
                }}
                sx={{ width: "max-content" }}
              >
                <Users />
              </IconButton> */}
              {isMobile && (
                <Button
                  onClick={() => handleNewChatButtonClick(userId as string)}
                  variant="contained"
                  sx={{ width: "100%", p: "1" }}
                >
                  New Chat
                </Button>
              )}
            </Stack>
          </Stack>
          <Stack sx={{ width: "100%" }}>
            <Search>
              <SearchIconWrapper>
                <MagnifyingGlass color="#709CE6" />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder={
                  isPinnedClicked
                    ? "Search pinned chats..."
                    : isStarredClicked
                    ? "Search starred chats..."
                    : "Search all chats..."
                }
                inputProps={{ "aria-label": "search" }}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </Search>
          </Stack>
          <Stack sx={{ width: "100%" }} spacing={1}>
            <Stack
              direction={"row"}
              spacing={1}
              alignItems="center"
              sx={{ width: "100%" }}
            >
              <Tooltip title="All chats">
                <Button
                  variant={isAllChatsClicked ? "contained" : "text"}
                  sx={{ width: "100%", p: "2px" }}
                  onClick={handleAllChatsClick}
                >
                  All chats
                </Button>
              </Tooltip>
              <Tooltip title="Pinned chats">
                <Button
                  variant={isPinnedClicked ? "contained" : "text"}
                  sx={{ width: "100%" }}
                  onClick={handlePinnedClick}
                >
                  Pinned
                </Button>
              </Tooltip>
              <Tooltip title="Starred Messages">
                <Button
                  variant={isStarredClicked ? "contained" : "text"}
                  sx={{ width: "100%" }}
                  onClick={handleStarredClick}
                >
                  Starred
                </Button>
              </Tooltip>
            </Stack>
            <Divider />
          </Stack>
          <Stack
            sx={{
              flexGrow: 1,
              overflowY: "scroll",
              // overflowY:  isDesktop ? "scroll" : "hidden"              ,
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
                  theme.palette.mode === "light" ? "#ccc" : "#666",
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
            }}
          >
            <SimpleBarStyle clickOnTrack={false}>
              <Stack spacing={2.4}>
                <Stack spacing={2.4}>
                  {isAllChatsClicked &&
                    [...filteredChats].reverse().map((el) => {
                      return <ChatElement chat={el} key={el._id} />;
                    })}

                  {isPinnedClicked &&
                    filteredChats?.map((el) => {
                      return <ChatElement chat={el} key={el._id} />;
                    })}
                  {isStarredClicked &&
                    filteredStarredMessages?.map((el) => {
                      return (
                        <StarredMessagesElement
                          starredMessage={el}
                          key={el._id}
                        />
                      );
                    })}
                </Stack>
              </Stack>
            </SimpleBarStyle>
          </Stack>
        </Stack>
      </Box>
    </>
  );
};

export default ChatSection;
