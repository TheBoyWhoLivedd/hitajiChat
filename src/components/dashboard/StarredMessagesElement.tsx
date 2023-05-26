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
import useResponsive from "@/utils/hooks/useResponsive";
import { Pen, Trash } from "phosphor-react";
import DeleteChatDialog from "@/components/dialogs/DeleteChatDialog";
import ChangeChatTitleDialog from "@/components/dialogs/ChangeChatTitleDialog";
import { useRouter } from "next/router";
import { StarredMessage } from "../../../types";
import { RootState } from "@/redux/rootReducer";

const truncateText = (string: string, n: number): string => {
  return string?.length > n ? `${string.slice(0, n)}...` : string;
};

const StyledChatBox = styled(Box)(({ theme }) => ({
  "&:hover": {
    cursor: "pointer",
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

const StarredMessagesElement = ({
  starredMessage,
}: {
  starredMessage: StarredMessage;
}) => {
  const { chat_title, content, _id } = starredMessage;
  const [openDelete, setOpenDelete] = useState(false);
  const [openChatTitle, setOpenChatTitle] = useState(false);
  const isDesktop = useResponsive("up", "md");
  const dispatch = useDispatch();
  const router = useRouter();
  const { query } = router;
  const selectedChatId = query.id;
  const chats = useSelector((state: RootState) => state.chats.chats);

  const handleCloseDelete = () => {
    setOpenDelete(false);
  };
  const handleCloseChatTitle = () => {
    setOpenChatTitle(false);
  };
  let isSelected = selectedChatId === _id;

  if (!selectedChatId) {
    isSelected = false;
  }

  const theme = useTheme();

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
        // onClick={() => {
        //   searchParams.set("id", _id);
        //   searchParams.set("type", "individual-starred-message");
        //   setSearchParams(searchParams);
        //   if (!isDesktop) {
        //     dispatch(setChatsBar());
        //   }
        // }}
        onClick={() => {}}
        direction="row"
        alignItems={"center"}
        justifyContent="space-between"
      >
        <Stack spacing={0.3}>
          <Typography variant="subtitle2">
            {truncateText(chat_title, 30)}
          </Typography>
          <Typography variant="caption">{truncateText(content, 70)}</Typography>
        </Stack>
      </Stack>
    </StyledChatBox>
  );
};

export default StarredMessagesElement;
