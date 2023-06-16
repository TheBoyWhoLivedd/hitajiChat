import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useTheme,
} from "@mui/material";
import Slide, { SlideProps } from "@mui/material/Slide";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { showSnackbar } from "../../redux/slices/app";
import axios from "axios";
import { useRouter } from "next/router";
import { deleteChat } from "@/redux/slices/chats";
import { RootState } from "@/redux/rootReducer";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";

interface DeleteChatDialogProps {
  open: boolean;
  handleClose: () => void;
}

const DeleteChatDialog: React.FC<DeleteChatDialogProps> = ({
  open,
  handleClose,
}) => {
  const chats = useSelector((state: RootState) => state.chats.chats);
  const dispatch =
    useDispatch<ThunkDispatch<RootState, undefined, AnyAction>>();
  const router = useRouter();
  const { query } = router;
  const chatId = query.id;
  const theme = useTheme();
  const userId = useSelector((state: RootState) => state.user.user?._id);
  const Transition = React.forwardRef<HTMLDivElement, SlideProps>(
    (props, ref) => {
      return <Slide direction="up" ref={ref} {...props} />;
    }
  );
  Transition.displayName = "Transition";

  const handleChatDelete = async () => {
    try {
      // made it optimistic delete
      // setDeleting(true)
      handleClose();
      dispatch(deleteChat({ chatId }));
      router.push("/dashboard");
      dispatch(
        showSnackbar({
          severity: "success",
          message: "Chat Deleted Successfully",
        })
      );
      const response = await axios.delete(`/api/save/${userId}/${chatId}`);

      // setDeleting(false)
      console.log(
        "🚀 ~ file: DeleteChatDialog.tsx:29 ~ handleChatDelete ~ response:",
        response
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
      <DialogTitle>Delete this chat</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-slide-description">
          Are you sure you want to delete this chat?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleChatDelete}>Delete</Button>
      </DialogActions>
    </Dialog>
  );
};
export default DeleteChatDialog;
