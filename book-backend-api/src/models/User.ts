import { model, Schema } from "mongoose";

// const readingListSchema = new Schema({
//   bookRefId: {
//     type: Schema.Types.ObjectId,
//     ref: 'book',
//     required: true
//   },
//   status: {
//     type: String,
//     enum: ['read', 'pending', 'waiting list', 'unknown', 'lend'],
//     default: 'unknown'
//   }
// });

const userSchema = new Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },
    lastname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    // readingList: [readingListSchema], ggf. Order?
  },
  { timestamps: true },
);

const User = model("User", userSchema);
export default User;