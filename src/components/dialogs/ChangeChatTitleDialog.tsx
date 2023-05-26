import {
  Stack,
  Typography,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import React, { useRef} from "react";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../redux/slices/app";
import { updateChatTitle } from "../../redux/slices/chats";
import axios from "axios";
import { useRouter } from "next/router";
import { RootState } from "@/redux/rootReducer";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import Slide, { SlideProps } from "@mui/material/Slide";

interface ChangeChatTitleDialogProps {
  open: boolean;
  handleClose: () => void;
}

const ChangeChatTitleDialog = ({
  open,
  handleClose,
}: ChangeChatTitleDialogProps) => {
  const chats = useSelector((state: RootState) => state.chats.chats);
  const dispatch =
    useDispatch<ThunkDispatch<RootState, undefined, AnyAction>>();
  const router = useRouter();
  const { query } = router;
  const chatId = query.id;
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const inputRef = useRef<HTMLInputElement>(null);
  const Transition = React.forwardRef<HTMLDivElement, SlideProps>(
    (props, ref) => {
      return <Slide direction="up" ref={ref} {...props} />;
    }
  );
  Transition.displayName = "Transition";

  const chat = chats.find((chat) => chat._id === chatId);
  const chatTitle = chat && chat.title;
  const handleTitleChange = async () => {
    const newTitleValue = inputRef.current
      ? inputRef.current.value
      : "new chat";
    try {
      const content = newTitleValue;

      handleClose();
      // const maxLength = 11; // maximum number of characters to show in the title
      let title = content && content.toLowerCase(); // extract first maxLength characters
      // if (content.length > maxLength) {
      //   title += "..."; // add ellipsis if message is longer than maxLength
      // }
      const data = {
        title,
      };
      const response = await axios.patch(`/api/save/${userId}/${chatId}`, data);
      dispatch(updateChatTitle({ chatId, title }));
      dispatch(
        showSnackbar({ severity: "success", message: response.data.message })
      );
    } catch (error: any) {
      dispatch(showSnackbar({ severity: "error", message: error.message }));
    }
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
    >
      <DialogTitle>Title: {chatTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description"></DialogContentText>
        <Stack spacing={1} direction="row">
          <TextField
            inputRef={inputRef}
            autoFocus
            margin="dense"
            id="newTitle"
            label="New Title"
            variant="standard"
            sx={{ flexGrow: 1 }}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleTitleChange}>Change</Button>
      </DialogActions>
    </Dialog>
  );
};
export default ChangeChatTitleDialog;
