import { createSlice } from '@reduxjs/toolkit';
import { UserState } from '../../../types';


const initialState:UserState  = {
  user:null
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateUser(state, action) {
      state.user = action.payload;
    },
    logoutUser(state) {
      state.user = null;
    },
  },
});

export const { updateUser,logoutUser } = userSlice.actions;

export default userSlice.reducer;
