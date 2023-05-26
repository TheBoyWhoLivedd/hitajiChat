import { createSlice } from '@reduxjs/toolkit';

const buttonsSlice = createSlice({
  name: 'buttons',
  initialState: {
    allChatsClicked: true,
    pinnedClicked: false,
    starredClicked: false,
  },
  reducers: {
    setAllChatsClicked: (state, action) => {
      state.allChatsClicked = action.payload;
      state.pinnedClicked = false;
      state.starredClicked = false;
    },
    setPinnedClicked: (state, action) => {
      state.pinnedClicked = action.payload;
      state.allChatsClicked = false;
      state.starredClicked = false;
    },
    setStarredClicked: (state, action) => {
      state.starredClicked = action.payload;
      state.allChatsClicked = false;
      state.pinnedClicked = false;
    },
  },
});

export const { setAllChatsClicked, setPinnedClicked, setStarredClicked } = buttonsSlice.actions;

export default buttonsSlice.reducer;
