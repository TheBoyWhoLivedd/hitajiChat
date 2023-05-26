import mongoose, { Schema, model, models } from "mongoose";

const ChatSchema = new Schema(
  {
    title: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    messages: [
      {
        content: {
          type: String,
          required: true,
        },
        role: {
          type: String,
          enum: ["user", "assistant", "system"],
          required: true,
        },
        starred: {
          type: Boolean,

          default: false,
        },
        _id: {
          type: String,
        },
      },

      {
        timestamps: true,
      },
    ],
    pinned: {
      type: Boolean,
      default: false,
    },
    isTitleUpdated: {
      type: Boolean,
      default: false,
    },
    isSummarized: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Chat = models.Chat || model("Chat", ChatSchema);

