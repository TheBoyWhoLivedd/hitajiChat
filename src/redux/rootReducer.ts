import { combineReducers } from "redux";
import storage from "redux-persist/lib/storage";
// slices
import appReducer from "./slices/app";
import authReducer from "./slices/auth";
import ChatsButtonsReducer from "./slices/chatsButtons";
import userReducer from "./slices/user";
import ChatsReducer from "./slices/chats";
import starredMessagesReducer from "./slices/starredMessages";

// ----------------------------------------------------------------------

const rootPersistConfig = {
  key: "root",
  storage,
  keyPrefix: "redux-",
  whitelist: ["app", "auth", "buttons"],
  blacklist: ["user","chats","starredMessages"],
};

const rootReducer = combineReducers({
  app: appReducer,
  auth: authReducer,
  buttons: ChatsButtonsReducer,
  user: userReducer,
  chats: ChatsReducer,
  starredMessages: starredMessagesReducer,
});


export type RootState = ReturnType<typeof rootReducer>;

export { rootPersistConfig, rootReducer };
