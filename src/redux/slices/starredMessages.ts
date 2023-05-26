import { createSlice } from "@reduxjs/toolkit";
import { StarredMessage } from "../../../types";
type starredMessagesState = {
  starredMessages: StarredMessage[];
};

const initialState: starredMessagesState = {
  starredMessages: [],
};

const starredMessagesSlice = createSlice({
  name: "starredMessages",
  initialState,
  reducers: {
    updateStarredMessages(state, action) {
      state.starredMessages = action.payload;
    },
    addStarredMessage(state, action) {
      state.starredMessages = [...state.starredMessages, action.payload];
    },
    removeStarredMessages: (state, action) => {
      const { messageId } = action.payload;
      state.starredMessages = state.starredMessages.filter(
        (starredMessage) => starredMessage.messageId !== messageId
      );
    },
  },
});

export const {
  updateStarredMessages,
  addStarredMessage,
  removeStarredMessages,
} = starredMessagesSlice.actions;

export default starredMessagesSlice.reducer;
