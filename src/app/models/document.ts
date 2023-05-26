import {Schema, model, models} from "mongoose"

const DocumentSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
},
{
  timestamps: true,
},
);

export const Documents = models.Document || model("Document", DocumentSchema);
