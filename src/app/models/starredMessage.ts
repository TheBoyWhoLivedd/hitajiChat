import { Schema, model, models } from "mongoose";

const StarredMessageSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    chat_title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant","system"],
      required: true,
    },
    starred: {
      type: Boolean,
      required: true,
      default: true,
    },
    messageId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    chatId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const StarredMessage =
  models.StarredMessage || model("StarredMessage", StarredMessageSchema);
