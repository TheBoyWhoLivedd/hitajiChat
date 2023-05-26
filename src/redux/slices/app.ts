import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppState } from "../../../types";

// ----------------------------------------------------------------------

const initialState: AppState = {
  sideBar: {
    open: false,
    type: "CONTACT",
  },
  isLoggedIn: true,
  isChatsBarOpen: true,
  isDarkMode: false,
  isTyping: false,
  isLastMessage: false,
  snackbar: {
    open: null,
    severity: null,
    message: null,
  },
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    // Toggle Sidebar
    toggleSideBar(state) {
      state.sideBar.open = !state.sideBar.open;
    },
    updateSideBarType(
      state,
      action: PayloadAction<{ type: AppState["sideBar"]["type"] }>
    ) {
      state.sideBar.type = action.payload.type;
    },
    changeDarkModeIcon(state) {
      state.isDarkMode = !state.isDarkMode;
    },
    setChatsBar(state) {
      state.isChatsBarOpen = !state.isChatsBarOpen;
    },
    setIsTyping(state) {
      state.isTyping = !state.isTyping;
    },

    openSnackBar(
      state,
      action: PayloadAction<{ severity: string; message: string }>
    ) {
      state.snackbar.open = true;
      state.snackbar.severity = action.payload.severity;
      state.snackbar.message = action.payload.message;
    },
    closeSnackBar(state) {
      state.snackbar.open = false;
      state.snackbar.message = null;
    },
  },
});

// Reducer
export default appSlice.reducer;

export const { changeDarkModeIcon, setChatsBar, setIsTyping } =
  appSlice.actions;

// ----------------------------------------------------------------------

// export const closeSnackBar = () => async (dispatch: any, getState: any) => {
//   dispatch(appSlice.actions.closeSnackBar());
// };

// export function ToggleSidebar() {
//   return (dispatch: any, getState: any) => {
//     dispatch(appSlice.actions.toggleSideBar());
//   };
// }

// export function UpdateSidebarType(type: AppState["sideBar"]["type"]) {
//   return (dispatch: any, getState: any) => {
//     dispatch(appSlice.actions.updateSideBarType({ type }));
//   };

// }

//These dont need to be a thunk actions because they are only dispatching a single aciton with no delay or conditon

export const closeSnackBar = () => appSlice.actions.closeSnackBar();
export const ToggleSidebar = () => appSlice.actions.toggleSideBar();
export const UpdateSidebarType = (type: AppState["sideBar"]["type"]) => appSlice.actions.updateSideBarType({ type });


export const showSnackbar =
  ({ severity, message }: { severity: string; message: string }) =>
   (dispatch: any, getState: any) => {
    dispatch(
      appSlice.actions.openSnackBar({
        message,
        severity,
      })
    );

    setTimeout(() => {
      dispatch(appSlice.actions.closeSnackBar());
    }, 4000);
  };


