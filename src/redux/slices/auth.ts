import { createSlice } from "@reduxjs/toolkit";

// ----------------------------------------------------------------------
type authState = {
  isLoggedIn: boolean;
  isGoogleLoggedIn: boolean;
  token: string;
  isLoading: boolean;
  user: null;
  email: string;
  error: boolean;
};
const initialState: authState = {
  isLoggedIn: false,
  isGoogleLoggedIn: false,
  token: "",
  isLoading: false,
  user: null,
  email: "",
  error: false,
};

const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    updateIsLoading(state, action) {
      state.error = action.payload.error;
      state.isLoading = action.payload.isLoading;
    },
    logIn(state, action) {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.token = action.payload.token;
    },
    googleLogIn(state) {
      state.isGoogleLoggedIn = !state.isGoogleLoggedIn;
    },
    signOut(state, action) {
      state.isLoggedIn = false;
      state.token = "";
      state.user = null;
    },
    updateRegisterEmail(state, action) {
      state.email = action.payload.email;
    },
    updateUser(state, action) {
      state.user = action.payload.user;
    },
  },
});

// Reducer
export default slice.reducer;
export const {
  googleLogIn,
  logIn,
  updateUser,
} = slice.actions;
