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
import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { showSnackbar } from "../../redux/slices/app";
import { updateChatTitle } from "../../redux/slices/chats";
import axios from "axios";
import { useTheme } from "@mui/material/styles";
import { debounce } from "lodash";
import { RootState } from "@/redux/rootReducer";
import { ThunkDispatch } from "redux-thunk";
import { AnyAction } from "redux";
import Slide, { SlideProps } from "@mui/material/Slide";

interface UploadDocumentDialogProps {
  open: boolean;
  handleClose: () => void;
}

const UploadDocumentDialog = ({
  open,
  handleClose,
}: UploadDocumentDialogProps) => {
  const theme = useTheme();
  const dispatch =
    useDispatch<ThunkDispatch<RootState, undefined, AnyAction>>();
  // const userId = useSelector((state: RootState) => state.auth.user?._id);
  const token = useSelector((state: RootState) => state.auth.token);
  const Transition = React.forwardRef<HTMLDivElement, SlideProps>(
    (props, ref) => {
      return <Slide direction="up" ref={ref} {...props} />;
    }
  );
  Transition.displayName = "Transition";
  const [files, setFiles] = useState<File[]>([]);
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData();
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        formData.append(files[i].name, files[i]);
      }
      try {
        const headers = {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        };
        handleClose();
        const response = await axios.post(`/upload`, formData, { headers });
        dispatch(
          showSnackbar({ severity: "success", message: response.data.message })
        );
      } catch (error: any) {
        dispatch(showSnackbar({ severity: "error", message: error.message }));
      }
    } else {
      dispatch(
        showSnackbar({ severity: "error", message: "please select a file" })
      );
      handleClose();
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
      <form onSubmit={handleSubmit}>
        {/* <DialogTitle>Attach Documents</DialogTitle> */}
        <DialogContent sx={{ textAlign: "center", marginTop: 6 }}>
          <Button variant="outlined" component="label">
            <Typography
              variant="subtitle2"
              sx={{ textTransform: "none" }}
              component="span"
            >
              Select a PDF
            </Typography>
            <input
              type="file"
              hidden
              onChange={(e) =>
                setFiles(e.target.files ? Array.from(e.target.files) : [])
              }
              multiple
            />
          </Button>
          <Typography
            variant="subtitle2"
            sx={{
              textTransform: "none",
              color: theme.palette.primary.main,
              marginLeft: 1,
            }}
            component="span"
          >
            {!files
              ? "No file selected"
              : `${files?.length} ${
                  files?.length > 1 ? "files" : "file"
                } selected`}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="text">
            Upload
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
export default UploadDocumentDialog;
