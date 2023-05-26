import { Document, Model } from "mongoose";
import { NextApiRequest } from "next";

type Grey = {
    0: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
    500_8: string;
    500_12: string;
    500_16: string;
    500_24: string;
    500_32: string;
    500_48: string;
    500_56: string;
    500_80: string;
  }
  type ResponsiveFontSizesProps = {
    sm: number;
    md: number;
    lg: number;
  }
  
  type ResponsiveFontSizesResult = {
    '@media (min-width:600px)': {
      fontSize: string;
    };
    '@media (min-width:900px)': {
      fontSize: string;
    };
    '@media (min-width:1200px)': {
      fontSize: string;
    };
  }
  type TypographyVariant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle1' | 'subtitle2' | 'body1' | 'body2' | 'caption' | 'button';

  type Typography = {
    fontFamily: string;
    fontSize: string;
    fontWeight: number | string;
    lineHeight: number | string;
    letterSpacing?: string;
  };
  
  type ThemeTypography = {
    [key in TypographyVariant]: Typography | string;
  };
  type PaletteMode = 'light' | 'dark';

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
  
  type StarredMessage = {
    chat_title: string;
    content: string;
    role: "user" | "assistant";
    starred: boolean;
    messageId: string;
    _id: string;
  };
  
  type IUser = {
    firstName: string;
    lastName: string;
    avatar?: string;
    email: string;
    password?: string;
    passwordChangedAt?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    createdAt?: Date;
    updatedAt?: Date;
    verified?: boolean;
    otp?: string;
    otp_expiry_time?: Date;
    chats?: Chat[];
    starred_messages?: StarredMessage[];
    correctPassword?: (
      candidatePassword: string,
      userPassword: string
    ) => Promise<boolean>;
    correctOTP?: (candidateOTP: string, userOTP: string) => Promise<boolean>;
    changedPasswordAfter?: (JWTTimeStamp: number) => boolean;
    createPasswordResetToken?: () => string;
  } & Document;
  
  type IUserModel = Model<IUser>;
  
  type VectorResult = { text: string; vector: number[]; similarity?: number };
  
  type UserObject = {
    _id: string;
    name: string;
    email: string;
    image: string;
  }

  type UserState = {
    user: UserObject | null;}
    
  type AppState = {
    sideBar: {
      open: boolean;
      type: "CONTACT" | "STARRED" | "SHARED";
    };
    isLoggedIn: boolean;
    isChatsBarOpen: boolean;
    isDarkMode: boolean;
    // selectedChat: string;
    isTyping: boolean;
    isLastMessage: boolean;
    snackbar: {
      open: null | boolean;
      severity: null | string;
      message: null | string;
    };
  }



  interface ExtendedNextApiRequest extends NextApiRequest {
    pinecone: PineconeClient;
    indexName: string;
  }