import React, { useState } from "react";
import {
  Box,
  Badge,
  Stack,
  Avatar,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import { styled, useTheme, alpha } from "@mui/material/styles";
import { useDispatch, useSelector } from "react-redux";
import { setChatsBar } from "@/redux/slices/app";
import useResponsive from "@/utils/hooks/useResponsive";
import { Pen, Trash } from "phosphor-react";
import DeleteChatDialog from "@/components/dialogs/DeleteChatDialog";
import ChangeChatTitleDialog from "@/components/dialogs/ChangeChatTitleDialog";
// import { setSelectedChat } from "@/redux/slices/chats";
import { useRouter } from "next/router";
import { RootState } from "@/redux/rootReducer";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import { ChatProps } from "../../../types";

const truncateText = (string: string, n: number) => {
  return string.length > n ? `${string.slice(0, n)}...` : string;
};

const StyledChatBox = styled(Box)(({ theme }) => ({
  "&:hover": {
    cursor: "pointer",
    backgroundColor: alpha(theme.palette.primary.main, 0.3),
    transition: "background-color linear", // add this line
  },
}));

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

const ChatElement = ({ chat }: { chat: ChatProps }) => {
  const { title, messages, _id, pinned } = chat;
  const [openDelete, setOpenDelete] = useState(false);
  const [openChatTitle, setOpenChatTitle] = useState(false);
  const isDesktop = useResponsive("up", "md");
  const dispatch =
    useDispatch<ThunkDispatch<RootState, undefined, AnyAction>>();
  const chats = useSelector((state: RootState) => state.chats.chats);

  const handleCloseDelete = () => {
    setOpenDelete(false);
  };
  const handleCloseChatTitle = () => {
    setOpenChatTitle(false);
  };
  const router = useRouter();
  const theme = useTheme();
  const { pathname, query } = router;
  query.type = "individual-chat";
  const handleClick = () => {
    // Update the query object with the new chat id
    query.id = _id;

    // Replace the current URL without navigating away
    router.replace({ pathname, query }, undefined, { shallow: true });

    if (!isDesktop) {
      dispatch(setChatsBar());
    }
  };
  const selectedChatId = query.id;
  let isSelected = selectedChatId === _id;

  if (!selectedChatId) {
    isSelected = false;
  }
  return (
    <StyledChatBox
      sx={{
        width: "100%",

        borderRadius: 1,

        backgroundColor: isSelected
          ? theme.palette.mode === "light"
            ? alpha(theme.palette.primary.main, 0.5)
            : theme.palette.primary.main
          : theme.palette.mode === "light"
          ? "#fff"
          : theme.palette.background.paper,
      }}
      p={2}
    >
      <Stack
        onClick={handleClick}
        direction="row"
        alignItems={"center"}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={2}>
          <Stack spacing={0.3}>
            <Typography variant="subtitle2">
              {truncateText(title, 36)}
            </Typography>
            {/* <Typography variant="caption">{truncateText(msg, 20)}</Typography> */}
          </Stack>
        </Stack>
        <Stack spacing={2} alignItems={"center"}>
          {isSelected && (
            <Stack direction={"row"}>
              <Tooltip title="Change chat title">
                <IconButton
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenChatTitle(true);
                  }}
                >
                  <Pen />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete chat">
                <IconButton
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpenDelete(true);
                  }}
                >
                  <Trash />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
          {/* <Typography sx={{ fontWeight: 600 }} variant="caption">
            {time}
          </Typography> */}
          {/* <Badge
            className="unread-count"
            color="primary"
            badgeContent={unread}
          /> */}
        </Stack>
      </Stack>
      {openDelete && (
        <DeleteChatDialog
          open={openDelete}
          handleClose={handleCloseDelete}
        />
      )}
      {openChatTitle && (
        <ChangeChatTitleDialog
          open={openChatTitle}
          handleClose={handleCloseChatTitle}
        />
      )}
    </StyledChatBox>
  );
};

export default ChatElement;
