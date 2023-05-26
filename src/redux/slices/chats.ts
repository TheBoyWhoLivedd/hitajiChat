import { createSlice } from '@reduxjs/toolkit';
type Message = {
  content: string;
  role: "user" | "assistant" | "system";
  starred?: boolean;
  _id?: string;
};
type ChatProps = {
  title: string;
  userId: string,
  messages: Message[];
  pinned: boolean;
  isTitleUpdated: boolean;
  isSummarized: boolean;
  _id?: string;
};
type ChatState = {
  chats: ChatProps[];
};
const initialState: ChatState = {
  chats: [],
};

const ChatSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    updateChats(state, action) {
      state.chats = action.payload;
    },
    addChat(state, action) {
      state.chats = [...state.chats, action.payload];
    },
    deleteChat: (state, action) => {
      const { chatId } = action.payload;
      state.chats = state.chats.filter(chat => chat._id !== chatId);
     
    },
    addMessage: (state, action) => {
      const { chatId, messageToRedux } = action.payload;
      const chat = state.chats.find((chat) => chat._id === chatId);
      if (chat) {
        chat.messages.push(messageToRedux);
      }
    },
    updateChatTitle: (state, action) => {
      const { chatId,title } = action.payload;

      const chat = state.chats.find((chat) => chat._id === chatId);
      if(chat){

        chat.title = title;
        chat.isTitleUpdated = true;     
      }
    }, 
    updateIsSummarized: (state, action) => {
      const { chatId } = action.payload;

      const chat = state.chats.find((chat) => chat._id === chatId);
      if(chat){

        chat.isSummarized = true;
      }

     
    },
    updatePinState: (state, action) => {
      const { chatId } = action.payload;
    
      // Find the chat object with the specified ID
      const chat = state.chats.find(chat => chat._id === chatId);
    
      // Flip the value of the pinned property
      if (chat){

        chat.pinned = !chat.pinned;
      }
    
    },
    updateStarred: (state, action) => {
      const { chatId,messageId,starredProperty } = action.payload;

      const chat:ChatProps|undefined = state.chats.find((chat) => chat._id === chatId);
      if (chat){

        const message = chat.messages.find((message) => message._id === messageId);

        if(message){

          message.starred = starredProperty;
        }

      }

     
    },
    
  },
});

export const { updateChats, addChat,updateStarred,updatePinState,updateChatTitle,deleteChat,updateIsSummarized,addMessage } = ChatSlice.actions;

export default ChatSlice.reducer;
